"use client"

import { useRef, useState, useEffect } from "react"
import Webcam from "react-webcam"
import {
  Camera,
  Download,
  Share,
  RefreshCw,
  Film,
  Video,
  Settings,
  Maximize2,
  Filter,
  ImageIcon,
  ChevronDown,
  Facebook,
  Twitter,
  Mail,
  Instagram,
  Check,
  Grid,
  Layers,
  Sparkles,
} from "lucide-react"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const filters = [
  { name: "None", class: "filter-none" },
  { name: "Mono", class: "filter grayscale" },
  { name: "Sepia", class: "filter sepia" },
  { name: "Fade", class: "filter brightness-110 contrast-90 saturate-75" },
  { name: "Matte", class: "filter contrast-90 saturate-90 brightness-105" },
  { name: "Noir", class: "filter grayscale contrast-125 brightness-90" },
]

const backgrounds = [
  { name: "None", class: "bg-black" },
  { name: "Gradient", class: "bg-gradient-to-r from-neutral-900 to-neutral-800" },
  { name: "Pattern", class: "bg-[url('/placeholder.svg?height=720&width=1280')] bg-cover" },
]

const digitalProps = [
  { name: "Sunglasses", src: "/placeholder.svg?height=100&width=200", position: { top: "30%", left: "50%" } },
  { name: "Hat", src: "/placeholder.svg?height=100&width=100", position: { top: "5%", left: "50%" } },
  { name: "Mustache", src: "/placeholder.svg?height=50&width=150", position: { top: "50%", left: "50%" } },
]

export default function PhotoBooth() {
  const webcamRef = useRef(null)
  const stripRef = useRef(null)
  const [images, setImages] = useState([])
  const [countdown, setCountdown] = useState(null)
  const [mode, setMode] = useState("photo")
  const [isCapturing, setIsCapturing] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState(filters[0])
  const [selectedBackground, setSelectedBackground] = useState(backgrounds[0])
  const [gifFrames, setGifFrames] = useState([])
  const [videoBlob, setVideoBlob] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const [isMirrored, setIsMirrored] = useState(true)
  const [photoCount, setPhotoCount] = useState(4)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [countdownDelay, setCountdownDelay] = useState(3)
  const [previousCaptures, setPreviousCaptures] = useState([])
  const [isFiltersOpen, setIsFiltersOpen] = useState(true)
  const [isBackgroundsOpen, setIsBackgroundsOpen] = useState(false)
  const [isPreviousCapturesOpen, setIsPreviousCapturesOpen] = useState(false)
  const [selectedProps, setSelectedProps] = useState([])
  const [activeTab, setActiveTab] = useState("capture")
  const [stripLayout, setStripLayout] = useState("vertical")
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const date = new Date()
    setCurrentDate(date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }))
  }, [])

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  }

  // Photo strip capture
  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      setImages((prevImages) => [...prevImages, imageSrc])
    }
  }

  const startPhotoSequence = () => {
    setIsCapturing(true)
    setImages([])
    setShowResult(false)

    let photosTaken = 0
    let count = countdownDelay
    setCountdown(count)

    const countdownInterval = setInterval(() => {
      count--
      setCountdown(count)

      if (count === 0) {
        capturePhoto()
        photosTaken++

        if (photosTaken < photoCount) {
          // Reset countdown for next photo
          count = countdownDelay
          setCountdown(count)
        } else {
          // We've taken all photos
          clearInterval(countdownInterval)
          setIsCapturing(false)
          setCountdown(null)
          setTimeout(() => {
            setShowResult(true)
            // Add to previous captures
            setPreviousCaptures((prev) => [...prev, { type: "photo", images: [...images] }])
          }, 500)
        }
      }
    }, 1000)
  }

  // GIF mode
  const captureGif = () => {
    setIsCapturing(true)
    setGifFrames([])
    setShowResult(false)

    let framesCount = 0
    const totalFrames = 10

    const captureInterval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot()
        setGifFrames((prev) => [...prev, imageSrc])
        framesCount++

        if (framesCount >= totalFrames) {
          clearInterval(captureInterval)
          setIsCapturing(false)
          setShowResult(true)
          // In a real implementation, we would convert these frames to a GIF
          setPreviousCaptures((prev) => [...prev, { type: "gif", images: [...gifFrames] }])
        }
      }
    }, 200)
  }

  // Boomerang mode
  const captureBoomerang = () => {
    setIsCapturing(true)
    setGifFrames([])
    setShowResult(false)

    let framesCount = 0
    const totalFrames = 10

    const captureInterval = setInterval(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot()
        setGifFrames((prev) => [...prev, imageSrc])
        framesCount++

        if (framesCount >= totalFrames) {
          clearInterval(captureInterval)
          setIsCapturing(false)
          setShowResult(true)
          setPreviousCaptures((prev) => [...prev, { type: "boomerang", images: [...gifFrames] }])
        }
      }
    }, 200)
  }

  // Video recording
  const startRecording = () => {
    setIsRecording(true)
    setVideoBlob(null)
    setShowResult(false)

    const stream = webcamRef.current.video.srcObject
    mediaRecorderRef.current = new MediaRecorder(stream, {
      mimeType: "video/webm",
    })

    const chunks = []
    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data)
      }
    }

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" })
      const videoUrl = URL.createObjectURL(blob)
      setVideoBlob(videoUrl)
      setShowResult(true)
      setPreviousCaptures((prev) => [...prev, { type: "video", video: videoUrl }])
    }

    // Record for 5 seconds
    mediaRecorderRef.current.start()
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop()
        setIsRecording(false)
      }
    }, 5000)
  }

  const downloadResult = () => {
    if (mode === "photo" && stripRef.current) {
      html2canvas(stripRef.current).then((canvas) => {
        const link = document.createElement("a")
        link.download = "photobooth-strip.png"
        link.href = canvas.toDataURL("image/png")
        link.click()
      })
    } else if ((mode === "gif" || mode === "boomerang") && gifFrames.length > 0) {
      // In a real implementation, we would create and download a GIF
      // For now, just download the first frame
      const link = document.createElement("a")
      link.download = `photobooth-${mode}.png`
      link.href = gifFrames[0]
      link.click()
    } else if (mode === "video" && videoBlob) {
      const link = document.createElement("a")
      link.download = "photobooth-video.webm"
      link.href = videoBlob
      link.click()
    }
  }

  const resetBooth = () => {
    setImages([])
    setGifFrames([])
    setVideoBlob(null)
    setShowResult(false)
    setSelectedProps([])
  }

  const toggleProp = (prop) => {
    if (selectedProps.some((p) => p.name === prop.name)) {
      setSelectedProps(selectedProps.filter((p) => p.name !== prop.name))
    } else {
      setSelectedProps([...selectedProps, prop])
    }
  }

  const renderActionButton = () => {
    if (isCapturing || isRecording) {
      return (
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/10 backdrop-blur-md text-2xl font-light text-white">
          {countdown !== null ? countdown : ""}
        </div>
      )
    }

    switch (mode) {
      case "photo":
        return (
          <Button
            onClick={startPhotoSequence}
            size="lg"
            className="rounded-full h-16 w-16 bg-white hover:bg-white/90 text-black"
          >
            <Camera className="h-6 w-6" />
            <span className="sr-only">Take Photos</span>
          </Button>
        )
      case "gif":
        return (
          <Button
            onClick={captureGif}
            size="lg"
            className="rounded-full h-16 w-16 bg-white hover:bg-white/90 text-black"
          >
            <Film className="h-6 w-6" />
            <span className="sr-only">Create GIF</span>
          </Button>
        )
      case "boomerang":
        return (
          <Button
            onClick={captureBoomerang}
            size="lg"
            className="rounded-full h-16 w-16 bg-white hover:bg-white/90 text-black"
          >
            <RefreshCw className="h-6 w-6" />
            <span className="sr-only">Create Boomerang</span>
          </Button>
        )
      case "video":
        return (
          <Button
            onClick={startRecording}
            size="lg"
            className="rounded-full h-16 w-16 bg-white hover:bg-white/90 text-black"
          >
            <Video className="h-6 w-6" />
            <span className="sr-only">Record Video</span>
          </Button>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-white">
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <h1 className="text-xl font-light tracking-wide">PREMIUM PHOTOBOOTH</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab("capture")}
              className={`text-sm font-light tracking-wide px-4 py-2 transition-colors ${
                activeTab === "capture" ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              CAPTURE
            </button>
            <button
              onClick={() => setActiveTab("customize")}
              className={`text-sm font-light tracking-wide px-4 py-2 transition-colors ${
                activeTab === "customize" ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              CUSTOMIZE
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`text-sm font-light tracking-wide px-4 py-2 transition-colors ${
                activeTab === "gallery" ? "text-white" : "text-white/50 hover:text-white/80"
              }`}
            >
              GALLERY
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Camera and Controls */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-white/10">
              {!showResult ? (
                <div className="relative">
                  {/* Camera View */}
                  <div className="relative overflow-hidden aspect-video">
                    <div className={`absolute inset-0 ${selectedBackground.class}`}></div>
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      className={`w-full h-full object-cover ${isMirrored ? "scale-x-[-1]" : ""} ${selectedFilter.class}`}
                    />

                    {/* Camera Controls Overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-3">
                      <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                        <Filter className="h-5 w-5" />
                      </button>
                      <button className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                        <ImageIcon className="h-5 w-5" />
                      </button>
                      <button
                        className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                        onClick={() => setIsSettingsOpen(true)}
                      >
                        <Settings className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Center Text */}
                    {!isCapturing && !isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-4xl font-extralight tracking-wider text-white/70">Camera Preview</h2>
                      </div>
                    )}

                    {/* Countdown Overlay */}
                    {countdown !== null && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="text-white text-8xl font-extralight">{countdown}</div>
                      </div>
                    )}

                    {/* Recording Indicator */}
                    {isRecording && (
                      <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full">
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="text-white text-sm font-light">Recording</span>
                      </div>
                    )}
                  </div>

                  {activeTab === "capture" && (
                    <>
                      {/* Camera Mode Tabs */}
                      <div className="p-6 bg-[#1a1a1a] border-t border-white/10">
                        <Tabs defaultValue="photo" value={mode} onValueChange={setMode} className="w-full">
                          <TabsList className="grid grid-cols-4 bg-[#262626] p-1">
                            <TabsTrigger
                              value="photo"
                              className="data-[state=active]:bg-white data-[state=active]:text-black rounded-md"
                            >
                              Photo Strip
                            </TabsTrigger>
                            <TabsTrigger
                              value="video"
                              className="data-[state=active]:bg-white data-[state=active]:text-black rounded-md"
                            >
                              Video
                            </TabsTrigger>
                            <TabsTrigger
                              value="gif"
                              className="data-[state=active]:bg-white data-[state=active]:text-black rounded-md"
                            >
                              GIF
                            </TabsTrigger>
                            <TabsTrigger
                              value="boomerang"
                              className="data-[state=active]:bg-white data-[state=active]:text-black rounded-md"
                            >
                              Boomerang
                            </TabsTrigger>
                          </TabsList>

                          <div className="mt-6">
                            <div className="flex justify-center mb-6">{renderActionButton()}</div>

                            <TabsContent value="photo" className="space-y-4">
                              <div>
                                <Label className="text-xs text-white/70 mb-2 block uppercase tracking-wider">
                                  Number of Photos
                                </Label>
                                <div className="flex space-x-2">
                                  {[2, 3, 4].map((num) => (
                                    <button
                                      key={num}
                                      onClick={() => setPhotoCount(num)}
                                      className={`w-12 h-12 flex items-center justify-center text-sm transition-colors ${
                                        photoCount === num
                                          ? "bg-white text-black"
                                          : "bg-[#262626] text-white hover:bg-[#333333]"
                                      } rounded-md`}
                                    >
                                      {num}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <Label className="text-xs text-white/70 mb-2 block uppercase tracking-wider">
                                  Layout
                                </Label>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => setStripLayout("vertical")}
                                    className={`px-4 py-2 flex items-center justify-center text-sm transition-colors ${
                                      stripLayout === "vertical"
                                        ? "bg-white text-black"
                                        : "bg-[#262626] text-white hover:bg-[#333333]"
                                    } rounded-md`}
                                  >
                                    <Layers className="h-4 w-4 mr-2" />
                                    Vertical
                                  </button>
                                  <button
                                    onClick={() => setStripLayout("grid")}
                                    className={`px-4 py-2 flex items-center justify-center text-sm transition-colors ${
                                      stripLayout === "grid"
                                        ? "bg-white text-black"
                                        : "bg-[#262626] text-white hover:bg-[#333333]"
                                    } rounded-md`}
                                  >
                                    <Grid className="h-4 w-4 mr-2" />
                                    Grid
                                  </button>
                                </div>
                              </div>
                            </TabsContent>
                          </div>
                        </Tabs>
                      </div>
                    </>
                  )}

                  {activeTab === "customize" && (
                    <div className="p-6 bg-[#1a1a1a] border-t border-white/10">
                      <h3 className="text-sm font-medium mb-4 uppercase tracking-wider">Customize</h3>

                      <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen} className="mb-4">
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-[#262626] rounded-md">
                          <div className="flex items-center">
                            <Filter className="h-4 w-4 mr-2" />
                            <span className="text-sm font-light">Filters</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isFiltersOpen ? "rotate-180" : ""}`}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4">
                          <div className="grid grid-cols-6 gap-2">
                            {filters.map((filter) => (
                              <button
                                key={filter.name}
                                onClick={() => setSelectedFilter(filter)}
                                className={`p-2 rounded-md flex flex-col items-center justify-center transition-colors ${
                                  selectedFilter.name === filter.name
                                    ? "bg-white/10 ring-1 ring-white"
                                    : "bg-[#262626] hover:bg-[#333333]"
                                }`}
                              >
                                <div
                                  className={`w-12 h-12 rounded-md mb-1 overflow-hidden ${filter.class}`}
                                  style={{ backgroundImage: "url('/placeholder.svg?height=48&width=48')" }}
                                ></div>
                                <span className="text-xs">{filter.name}</span>
                              </button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <Collapsible open={isBackgroundsOpen} onOpenChange={setIsBackgroundsOpen} className="mb-4">
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-[#262626] rounded-md">
                          <div className="flex items-center">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            <span className="text-sm font-light">Backgrounds</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isBackgroundsOpen ? "rotate-180" : ""}`}
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-4">
                          <div className="grid grid-cols-3 gap-2">
                            {backgrounds.map((bg) => (
                              <button
                                key={bg.name}
                                onClick={() => setSelectedBackground(bg)}
                                className={`p-2 rounded-md flex flex-col items-center justify-center transition-colors ${
                                  selectedBackground.name === bg.name
                                    ? "bg-white/10 ring-1 ring-white"
                                    : "bg-[#262626] hover:bg-[#333333]"
                                }`}
                              >
                                <div className={`w-full h-16 rounded-md mb-1 overflow-hidden ${bg.class}`}></div>
                                <span className="text-xs">{bg.name}</span>
                              </button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}

                  {activeTab === "gallery" && (
                    <div className="p-6 bg-[#1a1a1a] border-t border-white/10">
                      <h3 className="text-sm font-medium mb-4 uppercase tracking-wider">Previous Captures</h3>

                      {previousCaptures.length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {previousCaptures.map((capture, index) => (
                            <div key={index} className="relative rounded-md overflow-hidden bg-[#262626]">
                              {capture.type === "video" ? (
                                <video
                                  src={capture.video}
                                  className="w-full h-24 object-cover"
                                  onMouseOver={(e) => e.target.play()}
                                  onMouseOut={(e) => e.target.pause()}
                                />
                              ) : (
                                <img
                                  src={capture.images[0] || "/placeholder.svg?height=96&width=128"}
                                  alt={`Capture ${index}`}
                                  className="w-full h-24 object-cover"
                                />
                              )}
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-xs p-1 text-center">
                                {capture.type}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-white/50 text-sm bg-[#262626] rounded-md">
                          No previous captures
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 bg-[#1a1a1a]">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-light tracking-wider">
                      {mode.charAt(0).toUpperCase() + mode.slice(1)} Result
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={resetBooth}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      New Capture
                    </Button>
                  </div>

                  {mode === "photo" && (
                    <div
                      ref={stripRef}
                      className={`bg-[#262626] p-6 max-w-md mx-auto rounded-md border border-white/10`}
                    >
                      <div className="text-center mb-6">
                        <h4 className="font-light text-xl tracking-wider">PHOTO STRIP</h4>
                        <p className="text-xs text-white/60 mt-1">{currentDate}</p>
                      </div>
                      <div className={stripLayout === "vertical" ? "space-y-4" : "grid grid-cols-2 gap-4"}>
                        {images.map((src, index) => (
                          <div key={index} className="overflow-hidden rounded-md">
                            <img
                              src={src || "/placeholder.svg?height=200&width=400"}
                              alt={`Photo ${index + 1}`}
                              className={`w-full ${selectedFilter.class}`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="text-center mt-6">
                        <p className="text-xs text-white/60">PREMIUM PHOTOBOOTH</p>
                      </div>
                    </div>
                  )}

                  {(mode === "gif" || mode === "boomerang") && gifFrames.length > 0 && (
                    <div className="max-w-md mx-auto">
                      {/* In a real implementation, this would be an animated GIF */}
                      <div className="overflow-hidden rounded-md border border-white/10">
                        <img
                          src={gifFrames[0] || "/placeholder.svg?height=400&width=400"}
                          alt="Animated result"
                          className={`w-full ${selectedFilter.class}`}
                        />
                      </div>
                      <p className="text-center text-xs text-white/60 mt-2">
                        {mode === "gif" ? "GIF preview (first frame shown)" : "Boomerang preview (first frame shown)"}
                      </p>
                    </div>
                  )}

                  {mode === "video" && videoBlob && (
                    <div className="max-w-md mx-auto">
                      <video
                        src={videoBlob}
                        controls
                        className={`w-full rounded-md border border-white/10 ${selectedFilter.class}`}
                      />
                    </div>
                  )}

                  <div className="mt-8 max-w-md mx-auto">
                    <h4 className="text-sm font-light mb-4 uppercase tracking-wider">Share your creation</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#262626] hover:bg-[#333333] text-white border-white/10"
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#262626] hover:bg-[#333333] text-white border-white/10"
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#262626] hover:bg-[#333333] text-white border-white/10"
                      >
                        <Instagram className="h-4 w-4 mr-2" />
                        Instagram
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-[#262626] hover:bg-[#333333] text-white border-white/10"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={downloadResult} className="bg-white hover:bg-white/90 text-black flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-4">
            <div className="bg-[#1a1a1a] rounded-lg overflow-hidden border border-white/10">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-sm font-medium uppercase tracking-wider">Photo Strip Preview</h3>
                <button className="text-white/70 hover:text-white">
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6">
                {mode === "photo" && (
                  <div className="space-y-3 bg-[#262626] rounded-md p-4 border border-white/10">
                    {[...Array(photoCount)].map((_, index) => (
                      <div
                        key={index}
                        className={`aspect-[4/3] bg-[#333333] rounded-md flex items-center justify-center ${
                          images[index] ? "" : "border border-dashed border-white/20"
                        }`}
                      >
                        {images[index] ? (
                          <img
                            src={images[index] || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className={`w-full h-full object-cover rounded-md ${selectedFilter.class}`}
                          />
                        ) : (
                          <span className="text-white/50 font-light text-sm">Photo {index + 1}</span>
                        )}
                      </div>
                    ))}

                    <div className="text-center text-xs text-white/50 mt-2">{currentDate}</div>
                  </div>
                )}

                {(mode === "gif" || mode === "boomerang") && (
                  <div className="aspect-square bg-[#262626] rounded-md flex items-center justify-center border border-dashed border-white/20">
                    {gifFrames.length > 0 ? (
                      <img
                        src={gifFrames[0] || "/placeholder.svg"}
                        alt="GIF Preview"
                        className={`w-full h-full object-cover rounded-md ${selectedFilter.class}`}
                      />
                    ) : (
                      <span className="text-white/50 font-light text-sm">
                        {mode === "gif" ? "GIF" : "Boomerang"} Preview
                      </span>
                    )}
                  </div>
                )}

                {mode === "video" && (
                  <div className="aspect-video bg-[#262626] rounded-md flex items-center justify-center border border-dashed border-white/20">
                    {videoBlob ? (
                      <video
                        src={videoBlob}
                        className={`w-full h-full object-cover rounded-md ${selectedFilter.class}`}
                        controls
                      />
                    ) : (
                      <span className="text-white/50 font-light text-sm">Video Preview</span>
                    )}
                  </div>
                )}

                {!showResult && (
                  <div className="mt-6">
                    <Button
                      className="w-full bg-white hover:bg-white/90 text-black"
                      onClick={() => {
                        if (mode === "photo") startPhotoSequence()
                        else if (mode === "gif") captureGif()
                        else if (mode === "boomerang") captureBoomerang()
                        else if (mode === "video") startRecording()
                      }}
                      disabled={isCapturing || isRecording}
                    >
                      {isCapturing || isRecording ? (
                        <span className="flex items-center">
                          <Sparkles className="animate-pulse mr-2 h-4 w-4" />
                          Processing...
                        </span>
                      ) : (
                        <>Capture</>
                      )}
                    </Button>

                    <div className="mt-6">
                      <h4 className="text-xs font-medium mb-3 uppercase tracking-wider">Share</h4>
                      <div className="flex justify-center space-x-3">
                        <button className="w-10 h-10 rounded-full bg-[#262626] hover:bg-[#333333] text-white flex items-center justify-center">
                          <Facebook className="h-4 w-4" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-[#262626] hover:bg-[#333333] text-white flex items-center justify-center">
                          <Twitter className="h-4 w-4" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-[#262626] hover:bg-[#333333] text-white flex items-center justify-center">
                          <Instagram className="h-4 w-4" />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-[#262626] hover:bg-[#333333] text-white flex items-center justify-center">
                          <Mail className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between mt-6">
                      <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                        <Share className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {!showResult && (
              <div className="mt-6 bg-[#1a1a1a] rounded-lg p-6 border border-white/10">
                <h3 className="text-sm font-medium mb-4 uppercase tracking-wider">Quick Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mirror-toggle" className="text-sm text-white/70">
                      Mirror Camera
                    </Label>
                    <Switch
                      id="mirror-toggle"
                      checked={isMirrored}
                      onCheckedChange={setIsMirrored}
                      className="data-[state=checked]:bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-white/70">Countdown Delay</Label>
                      <span className="bg-[#262626] px-3 py-1 rounded-md text-xs text-white min-w-[40px] text-center">
                        {countdownDelay}s
                      </span>
                    </div>
                    <Slider
                      value={[countdownDelay]}
                      min={1}
                      max={5}
                      step={1}
                      onValueChange={(value) => setCountdownDelay(value[0])}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-[#1a1a1a] border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-light tracking-wider">Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="mirror-toggle-dialog" className="text-sm text-white/70">
                Mirror Camera
              </Label>
              <Switch
                id="mirror-toggle-dialog"
                checked={isMirrored}
                onCheckedChange={setIsMirrored}
                className="data-[state=checked]:bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-white/70">Countdown Delay</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[countdownDelay]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(value) => setCountdownDelay(value[0])}
                  className="flex-1"
                />
                <span className="bg-[#262626] px-3 py-1 rounded-md text-sm text-white min-w-[40px] text-center">
                  {countdownDelay}s
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Button className="w-full bg-white hover:bg-white/90 text-black">
                <Check className="mr-2 h-4 w-4" />
                Apply Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
