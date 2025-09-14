'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Upload, Download, Eye, EyeOff, Trash2, Settings, Palette, Home, Lightbulb, Sparkles, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Photo {
  id: string
  file: File
  preview: string
  roomType?: string
  status: 'uploaded' | 'processing' | 'completed' | 'error'
  originalUrl?: string
  editedUrl?: string
  editLog?: any
  error?: string
}

interface Recipe {
  id: string
  name: string
  style: string
  floorMode: 'keep' | 'change'
  wallMode: 'keep' | 'repaint'
  floorType?: string
  wallColor?: string
  tasks: string[]
}

const ROOM_STYLES = [
  'None',            // NEW: default means "don’t restyle"
  'Modern',
  'Scandinavian',
  'Farmhouse',
  'Minimal',
  'Boho',
  'Luxury'
]


const ROOM_TYPES = [
  'living_room',
  'bedroom',
  'kitchen',
  'bathroom',
  'exterior'
]

const FLOOR_TYPES = [
  'light_oak',
  'dark_walnut',
  'white_tile',
  'gray_tile',
  'carpet_beige'
]

const WALL_COLORS = [
  '#FFFFFF',
  '#F5F5F5',
  '#E8E8E8',
  '#D3D3D3',
  '#C0C0C0'
]

export default function StageRight() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([])
  const [currentStyle, setCurrentStyle] = useState('None')        // was 'Modern'
  const [currentFloor, setCurrentFloor] = useState<'keep' | string>('keep')
  const [currentWallColor, setCurrentWallColor] = useState<'keep' | string>('keep')
  const [roomCondition, setRoomCondition] = useState<'vacant' | 'furnished'>('vacant')

  // right after currentWallColor:
  const [floorMode, setFloorMode] = useState<'keep' | 'change'>('keep')      // NEW
  const [wallMode, setWallMode] = useState<'keep' | 'repaint'>('keep')     // NEW
  const [declutterEnabled, setDeclutterEnabled] = useState(false)
  const [batchPrompt, setBatchPrompt] = useState('')
  const [showBefore, setShowBefore] = useState(true)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [apiKeyMissing, setApiKeyMissing] = useState(false)

  // Build a final custom prompt that respects "keep" sentinels
  function buildCustomPromptForKeep(userPrompt: string) {
    const hints: string[] = [];

    // Only add these when users picked "keep"
    if (currentStyle === 'None') hints.push('Do not change the interior design style.');
    if (currentFloor === 'keep') hints.push('Do not change or replace flooring.');
    if (currentWallColor === 'keep') hints.push('Do not repaint or alter wall color.');
// Always include the strong door/ceiling rule to prevent blocking
    hints.push('Keep all doors and egress zones totally clear; relocate any item that lands within ~36 inches (1 m) of any doorway or within the door swing. Do not add or modify any ceiling fixtures.');
    // join user's free text + our guard hints
    return [userPrompt.trim(), hints.join(' ')].filter(Boolean).join('\n\n');
  }

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (photos.length + files.length > 10) {
      alert('Maximum 10 photos allowed')
      return
    }

    files.forEach(file => {
      const id = Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)

      setPhotos(prev => [...prev, {
        id,
        file,
        preview,
        status: 'uploaded'
      }])
    })
  }, [photos.length])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    if (photos.length + files.length > 10) {
      alert('Maximum 10 photos allowed')
      return
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9)
        const preview = URL.createObjectURL(file)

        setPhotos(prev => [...prev, {
          id,
          file,
          preview,
          status: 'uploaded'
        }])
      }
    })
  }, [photos.length])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== id))
    setSelectedPhotos(prev => prev.filter(photoId => photoId !== id))
  }

  const togglePhotoSelection = (id: string) => {
    setSelectedPhotos(prev =>
      prev.includes(id)
        ? prev.filter(photoId => photoId !== id)
        : [...prev, id]
    )
  }

  const processPhotos = async () => {
    if (selectedPhotos.length === 0) {
      alert('Please select photos to process')
      return
    }

    setProcessing(true)
    setProgress(0)
    setApiKeyMissing(false)

    console.info('[StageRight] Processing photos:', {
      count: selectedPhotos.length,
      style: currentStyle,
      floorMode,
      currentFloor,
      wallMode,
      currentWallColor,
      declutter: declutterEnabled,
    })

    try {
      // Update selected photos to processing status
      setPhotos(prev => prev.map(photo =>
        selectedPhotos.includes(photo.id)
          ? { ...photo, status: 'processing' }
          : photo
      ))

      // Create FormData for API request
      const formData = new FormData()

      // Add selected photo files
      selectedPhotos.forEach(photoId => {
        const photo = photos.find(p => p.id === photoId)
        if (photo) {
          formData.append('files', photo.file)
        }
      })

      // Add processing parameters
      formData.append('style', currentStyle);          // "None" means keep style
      formData.append('floorType', currentFloor);      // "keep" means do not change
      formData.append('wallColor', currentWallColor);  // "keep" means do not repaint
      formData.append('declutter', declutterEnabled.toString());
      formData.append('roomCondition', roomCondition);

      // Build protective hints for the model
      const userPrompt = (batchPrompt || '').trim()
      const guardHints = [
        currentStyle === 'None' ? 'Do not change the interior design style.' : '',
        currentFloor === 'keep' ? 'Do not change or replace flooring.' : '',
        currentWallColor === 'keep' ? 'Do not repaint or alter wall color.' : '',
        // hard rules that catch your exact issues:
        'Do not add or modify any ceiling fixtures or textures; keep ceiling exactly as in the source.',
        'Keep all doors and egress clear; do not place tables, plants, or pillows within ~36 inches of any doorway or within the door swing.',
        'Do not block or alter wall AC units, thermostats, detectors, or switches.'
      ].filter(Boolean).join(' ')

      // const finalPrompt = [userPrompt, guardHints].filter(Boolean).join('\n\n')

      console.info('[StageRight] customPrompt provided?', Boolean(userPrompt), {
        length: userPrompt.length,
        style: currentStyle, floor: currentFloor, wall: currentWallColor, roomCondition
      });
      setBatchPrompt(''); // clear textarea now

      const hasKeep =
        currentStyle === 'None' || currentFloor === 'keep' || currentWallColor === 'keep';

      if (hasKeep || userPrompt) {
        const finalPrompt = buildCustomPromptForKeep(userPrompt);
        if (finalPrompt) formData.append('customPrompt', finalPrompt);
      }

      // Call API
      const response = await fetch('/api/process', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        if (result.error.includes('API key')) {
          setApiKeyMissing(true)
        }
        throw new Error(result.error)
      }

      // Update photos with results
      result.results.forEach((apiResult: any, index: number) => {
        const photoId = selectedPhotos[index]
        setPhotos(prev => prev.map(photo =>
          photo.id === photoId
            ? {
              ...photo,
              status: apiResult.status === 'completed' ? 'completed' : 'error',
              editedUrl: apiResult.processedUrl,
              editLog: apiResult.editLog,
              error: apiResult.error
            }
            : photo
        ))
        setProgress(((index + 1) / selectedPhotos.length) * 100)
      })

    } catch (error) {
      console.error('Processing error:', error)

      // Update failed photos
      setPhotos(prev => prev.map(photo =>
        selectedPhotos.includes(photo.id)
          ? { ...photo, status: 'error', error: error instanceof Error ? error.message : 'Processing failed' }
          : photo
      ))
    }

    setProcessing(false)
  }

  const saveRecipe = () => {
    const recipe: Recipe = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${currentStyle} Recipe`,
      style: currentStyle,
      floorMode,
      wallMode,
      floorType: floorMode === 'change' ? currentFloor : undefined,
      wallColor: wallMode === 'repaint' ? currentWallColor : undefined,
      tasks: declutterEnabled ? ['virtual_staging', 'declutter'] : ['virtual_staging'],
    }
    setRecipes(prev => [...prev, recipe])
  }

  const applyRecipe = (recipe: Recipe) => {
    setCurrentStyle(recipe.style)
    setFloorMode(recipe.floorMode || 'keep')
    setWallMode(recipe.wallMode || 'keep')
    if (recipe.floorType) setCurrentFloor(recipe.floorType)
    if (recipe.wallColor) setCurrentWallColor(recipe.wallColor)
    setDeclutterEnabled(recipe.tasks.includes('declutter'))
  }

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a')
    link.href = photo.editedUrl || photo.preview
    link.download = `staged_${photo.file.name}`
    link.click()
  }

  const downloadAll = () => {
    const completedPhotos = photos.filter(photo => photo.status === 'completed')
    completedPhotos.forEach(photo => downloadPhoto(photo))
  }

  const selectAll = () => {
    setSelectedPhotos(photos.map(photo => photo.id))
  }

  const clearSelection = () => {
    setSelectedPhotos([])
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">StageRight</h1>
            <Badge variant="secondary">Beta</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button onClick={downloadAll} disabled={photos.filter(p => p.status === 'completed').length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Download All ({photos.filter(p => p.status === 'completed').length})
            </Button>
          </div>
        </div>
      </header>

      {/* API Key Warning */}
      {apiKeyMissing && (
        <div className="px-6 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>API Key Required:</strong> Please add your Gemini API key to the .env.local file to enable photo processing.
              Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Controls */}
        <div className="w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto mb-4 text-slate-400" />
                  <p className="text-sm text-slate-600 mb-2">
                    Drag & drop photos here or click to browse
                  </p>
                  <p className="text-xs text-slate-500">
                    Up to 10 photos • JPG, PNG
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                <div className="mt-4 flex justify-between items-center text-sm">
                  <span className="text-slate-600">{photos.length}/10 photos uploaded</span>
                  {photos.length > 0 && (
                    <div className="space-x-2">
                      <Button variant="ghost" size="sm" onClick={selectAll}>
                        Select All
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearSelection}>
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Style Presets */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  Room Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={currentStyle} onValueChange={setCurrentStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_STYLES.map(style => (
                      <SelectItem key={style} value={style}>
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Optional Edits (no defaults) Remove Materials*/}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Optional Edits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Flooring */}
                <div>
                  <Label className="text-sm font-medium">Room Condition</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="roomCondition" checked={roomCondition === 'furnished'} onChange={() => setRoomCondition('furnished')} />
                      <span className="text-sm">Furnished (light restyle)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="roomCondition" checked={roomCondition === 'vacant'} onChange={() => setRoomCondition('vacant')} />
                      <span className="text-sm">Vacant (add furniture)</span>
                    </label>
                  </div>

                  <Label className="text-sm font-medium">Flooring</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="flooring"
                        checked={floorMode === 'keep'}
                        onChange={() => setFloorMode('keep')}
                      />
                      <span className="text-sm">Keep as-is</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="flooring"
                        checked={floorMode === 'change'}
                        onChange={() => setFloorMode('change')}
                      />
                      <span className="text-sm">Change to</span>
                    </label>

                    {floorMode === 'change' && (
                      <Select value={currentFloor} onValueChange={setCurrentFloor}>
                        <SelectTrigger className="w-56">
                          <SelectValue placeholder="Choose floor" />
                        </SelectTrigger>
                        <SelectContent>
                          {FLOOR_TYPES.map(floor => (
                            <SelectItem key={floor} value={floor}>
                              {floor.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                {/* Walls */}
                <div>
                  <Label className="text-sm font-medium">Walls</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="walls"
                        checked={wallMode === 'keep'}
                        onChange={() => setWallMode('keep')}
                      />
                      <span className="text-sm">Keep as-is</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="walls"
                        checked={wallMode === 'repaint'}
                        onChange={() => setWallMode('repaint')}
                      />
                      <span className="text-sm">Repaint</span>
                    </label>
                  </div>

                  {wallMode === 'repaint' && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {WALL_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${currentWallColor === color ? 'border-blue-500' : 'border-slate-300'
                            }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setCurrentWallColor(color)}
                          aria-label={`Set wall color ${color}`}
                        />
                      ))}
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={currentWallColor}
                          onChange={(e) => setCurrentWallColor(e.target.value)}
                          className="w-32"
                          placeholder="#FFFFFF"
                        />
                        <span className="text-xs text-slate-500">Hex</span>
                      </div>
                    </div>
                  )}
                  {wallMode === 'keep' && (
                    <p className="text-xs text-slate-500 mt-2">Walls will not be repainted.</p>
                  )}
                </div>
              </CardContent>
            </Card>


            {/* Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Declutter & Depersonalize</Label>
                  <Switch checked={declutterEnabled} onCheckedChange={setDeclutterEnabled} />
                </div>
              </CardContent>
            </Card>

            {/* Batch Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Optional: Add custom instructions for all selected photos..."
                  value={batchPrompt}
                  onChange={(e) => setBatchPrompt(e.target.value)}
                  className="min-h-[80px]"
                />
              </CardContent>
            </Card>

            {/* Process Button */}
            <Button
              onClick={processPhotos}
              disabled={processing || selectedPhotos.length === 0}
              className="w-full"
              size="lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {processing ? 'Processing...' : `Process ${selectedPhotos.length} Photos`}
            </Button>

            {processing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-slate-600 text-center">{Math.round(progress)}% complete</p>
              </div>
            )}

            {/* Save Recipe */}
            <Button variant="outline" onClick={saveRecipe} className="w-full">
              Save as Recipe
            </Button>
          </div>
        </div>

        {/* Center Panel - Photo Grid */}
        <div className="flex-1 p-6 overflow-y-auto">
          {photos.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Upload className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No photos uploaded</h3>
                <p className="text-slate-600">Upload photos to get started with virtual staging</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {photos.map(photo => (
                <Card key={photo.id} className={`cursor-pointer transition-all ${selectedPhotos.includes(photo.id) ? 'ring-2 ring-blue-500' : ''
                  }`}>
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={showBefore ? photo.preview : (photo.editedUrl || photo.preview)}
                        alt="Property"
                        className="w-full h-48 object-cover rounded-t-lg"
                        onClick={() => togglePhotoSelection(photo.id)}
                      />

                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <Badge variant={
                          photo.status === 'completed' ? 'default' :
                            photo.status === 'processing' ? 'secondary' :
                              photo.status === 'error' ? 'destructive' : 'outline'
                        }>
                          {photo.status}
                        </Badge>
                      </div>

                      {/* Selection Checkbox */}
                      <div className="absolute top-2 right-2">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPhotos.includes(photo.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-slate-300'
                          }`}>
                          {selectedPhotos.includes(photo.id) && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="absolute bottom-2 right-2 flex space-x-1">
                        {photo.status === 'completed' && (
                          <Button size="sm" variant="secondary" onClick={() => downloadPhoto(photo)}>
                            <Download className="w-3 h-3" />
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => removePhoto(photo.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      {/* Error Message */}
                      {photo.status === 'error' && photo.error && (
                        <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          {photo.error}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel - Variants & Queue */}
        <div className="w-80 bg-white border-l border-slate-200 p-6 overflow-y-auto">
          <Tabs defaultValue="queue" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="queue">Queue</TabsTrigger>
              <TabsTrigger value="variants">Variants</TabsTrigger>
            </TabsList>

            <TabsContent value="queue" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Processing Queue</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBefore(!showBefore)}
                >
                  {showBefore ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {showBefore ? 'Before' : 'After'}
                </Button>
              </div>

              {selectedPhotos.length === 0 ? (
                <p className="text-sm text-slate-600">Select photos to add to queue</p>
              ) : (
                <div className="space-y-2">
                  {selectedPhotos.map(photoId => {
                    const photo = photos.find(p => p.id === photoId)
                    return photo ? (
                      <div key={photoId} className="flex items-center space-x-3 p-2 bg-slate-50 rounded">
                        <img src={photo.preview} alt="" className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{photo.file.name}</p>
                          <p className="text-xs text-slate-600">{photo.status}</p>
                        </div>
                      </div>
                    ) : null
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="variants" className="space-y-4">
              <h3 className="font-medium">Style Variants</h3>
              <p className="text-sm text-slate-600">
                Generate multiple variants for each room after processing
              </p>
            </TabsContent>
          </Tabs>

          {/* Saved Recipes */}
          {recipes.length > 0 && (
            <div className="mt-6">
              <Separator className="mb-4" />
              <h3 className="font-medium mb-3">Saved Recipes</h3>
              <div className="space-y-2">
                {recipes.map(recipe => (
                  <Card key={recipe.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{recipe.name}</p>
                        <p className="text-xs text-slate-600">{recipe.style}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => applyRecipe(recipe)}>
                        Apply
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}