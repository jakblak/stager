/* app/api/process/route.ts
 * Virtual Staging API using Gemini
 * - Enforces hard constraints (no ceiling edits, no blocked doors/egress)
 * - Honors "None/keep" sentinels from the UI
 * - Supports vacant vs furnished behavior
 * - Returns data URLs for immediate preview/download
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Current image generation/editing model per Gemini docs
const MODEL = 'gemini-2.5-flash-image-preview'

/** Utility: humanize floor key */
function describeFloor(key: string) {
  const map: Record<string, string> = {
    light_oak: 'light oak hardwood',
    dark_walnut: 'dark walnut hardwood',
    white_tile: 'white ceramic tile',
    gray_tile: 'matte gray porcelain tile',
    carpet_beige: 'neutral beige carpet',
  }
  return map[key] || key.replaceAll('_', ' ')
}

/**
 * Build a staging prompt that encodes constraints + requested options.
 * - style: e.g., "Modern" or "None"
 * - floorType: "keep" or floor option
 * - wallColor: "keep" or hex like "#FFFFFF"
 * - roomCondition: "vacant" or "furnished"
 * - declutter: boolean
 * - customPrompt: user extras
 */
function createStagingPrompt(args: {
  style: string
  floorType: string
  wallColor: string
  roomCondition: 'vacant' | 'furnished'
  declutter: boolean
  customPrompt?: string
}) {
  const { style, floorType, wallColor, roomCondition, declutter, customPrompt } = args

  const styleText =
    style && style.toLowerCase() !== 'none'
      ? `Apply a tasteful ${style} interior design aesthetic.`
      : `Do not change the interior design style; keep the existing look.`

  const floorText =
    floorType === 'keep'
      ? 'Do not change or replace flooring.'
      : `Replace/adjust flooring to **${describeFloor(floorType)}** with realistic seams, textures, and shadows.`

  const wallText =
    wallColor === 'keep'
      ? 'Do not repaint or alter wall color.'
      : `Repaint walls to **${wallColor}** with clean even coverage. Preserve trim, baseboards, doors, windows.`

  const stagingMode =
    roomCondition === 'vacant'
      ? `SOURCE MAY BE EMPTY/UNFURNISHED: Virtually stage by adding a minimal, coherent set of furniture and decor appropriate to the room type.`
      : `SOURCE IS FURNISHED: Only restyle existing pieces and decor. Add new items only if necessary to complete a typical set for sales photos.`

  const declutterText = declutter
    ? `Declutter and depersonalize lightly: remove small mess, cables, personal photos, excess knickknacks.`
    : `Do not declutter unless it materially improves the image.`

  const HARD_RULES = `
HARD CONSTRAINTS (MUST FOLLOW):
- Do NOT add, remove, or modify any CEILING elements: no new pendants, chandeliers, fans, beams, or ceiling patterns.
- Keep all DOORS and EGRESS clear: do not place any object within ~36 inches (1 meter) of doorways or within the door swing arc.
- Do NOT block or move wall devices: thermostats, smoke/CO detectors, intercoms, AC/HVAC units, breakers, or switches.
- Keep WINDOWS, trim, radiators, and fixed architectural features unchanged (position/shape).
- Maintain true perspective, realistic lighting, shadows, reflections, and scale.
- Avoid any text/branding/watermarks added to the scene.
`.trim()

const DOOR_EGRESS_RULES = `
DOOR & EGRESS RULES — OVERRIDES STYLE IF NEEDED:
- Leave a clear rectangular "egress zone" extending at least ~36 inches (1 m) into the room from each visible door threshold and across the full width of the door + trim.
- Nothing may sit in that zone: no tables, lamps, plants, pillows, baskets, or art leaned on the floor.
- Keep the door handle and swing path visually unobstructed.
- If unsure where a door swings, assume the larger clearance and keep the zone clear.
- If any placed item intersects an egress zone, RELOCATE it to a nearby wall-adjacent position outside the zone (do not delete unless relocation is impossible).
- Rugs may run under sofas but should NOT extend into the egress zone in front of entry doors.
- Preferred placements for small decor: next to the seating area (away from doors), centered on the feature wall, or opposite the entry.
`.trim()

  const LAYOUT_CHECKLIST = `
LAYOUT CHECKLIST:
- Provide a clear circulation path to each door; no tables/pillows/plants in front of entry doors.
- Rugs centered and sized properly; furniture legs partially on rug where appropriate.
- Coffee/side tables placed with safe clearances; never in front of a primary entry door.
- Wall art proportionate; do not overlap detectors, AC units, or switches.
- Plants and decor only where they do not block access or devices.
`.trim()

  const NEGATIVE_LIST = `
NEGATIVE CONTENT TO AVOID:
- Extra ceiling fixtures (woven pendants, chandeliers) added where none existed.
- Small tables, pillows, or plants placed near/in front of doors or door swing.
- Over-cluttering (too many pillows/objects) or unrealistic materials/lighting.
`.trim()

  const OUTPUT = `
OUTPUT:
- Return ONLY the edited image at similar resolution to the input.
- If any constraint conflicts with styling, follow the constraint and keep the original element.
`.trim()

  const userAddendum = customPrompt?.trim()
    ? `USER NOTES:\n${customPrompt.trim()}`
    : ''

  return [
    'ROLE: Professional real-estate virtual stager. Produce photorealistic results suitable for MLS/marketing.',
    HARD_RULES,
    DOOR_EGRESS_RULES, 
    stagingMode,
    styleText,
    declutterText,
    floorText,
    wallText,
    LAYOUT_CHECKLIST,
    NEGATIVE_LIST,
    OUTPUT,
    userAddendum,
  ]
    .filter(Boolean)
    .join('\n\n')
}

/** Extract base64 image from a Gemini response */
function extractImageBase64(resp: any): string | null {
  // The SDK returns candidates[].content.parts[].inlineData.data for images
  const parts = resp?.candidates?.[0]?.content?.parts || []
  for (const p of parts) {
    if (p?.inlineData?.data) return p.inlineData.data as string
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key missing. Set GEMINI_API_KEY in .env.local.' },
        { status: 401 }
      )
    }

    const form = await req.formData()

    // Read controls from the client (with safe defaults)
    const style = String(form.get('style') || 'None')
    const floorType = String(form.get('floorType') || 'keep')
    const wallColor = String(form.get('wallColor') || 'keep')
    const declutter = String(form.get('declutter') || 'false') === 'true'
    const customPrompt = String(form.get('customPrompt') || '')
    const roomCondition =
      (String(form.get('roomCondition') || 'furnished') as 'vacant' | 'furnished')

    const files = form.getAll('files').filter(Boolean) as File[]
    const ai = new GoogleGenAI({ apiKey })

    // Build prompt once to keep behavior consistent across a batch
    const prompt = createStagingPrompt({
      style,
      floorType,
      wallColor,
      declutter,
      customPrompt,
      roomCondition,
    })

    // If there are no images, fall back to text-to-image (rare but supported)
    if (files.length === 0) {
      const resp = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      })
      const data = extractImageBase64(resp)
      if (!data) {
        const maybeText = resp?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text
        return NextResponse.json({ error: maybeText || 'No image returned.' }, { status: 500 })
      }
      return NextResponse.json({
        results: [{ status: 'completed', processedUrl: `data:image/png;base64,${data}`, editLog: { mode: 'text-to-image' } }],
      })
    }

    const results: any[] = []
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const mime = file.type || 'image/png'

        const response = await ai.models.generateContent({
          model: MODEL,
          contents: [
            { text: prompt },
            { inlineData: { mimeType: mime, data: base64 } },
          ],
        })

        const data = extractImageBase64(response)
        if (!data) {
          const maybeText = response?.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text
          results.push({
            status: 'error',
            error: maybeText || 'Model returned no image.',
            processedUrl: undefined,
            editLog: { mode: 'image-edit' },
          })
          continue
        }

        results.push({
          status: 'completed',
          processedUrl: `data:image/png;base64,${data}`,
          editLog: {
            mode: 'image-edit',
            style,
            floorType,
            wallColor,
            declutter,
            roomCondition,
          },
        })
      } catch (e: any) {
        results.push({
          status: 'error',
          error: e?.message || 'Failed to process image.',
          processedUrl: undefined,
          editLog: { mode: 'image-edit' },
        })
      }
    }

    return NextResponse.json({ results })
  } catch (err: any) {
    const message = err?.message || 'Processing failed'
    const status = /apikey|key/i.test(message) ? 401 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
