'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { useTheme } from '../hooks'
import { Palette, Sun, Moon, Laptop } from 'lucide-react'

export default function ThemeControls() {
  const {
    isDark,
    darkMode,
    primaryColor,
    toggleDarkMode,
    setDarkMode,
    setPrimaryColor,
    resetTheme,
  } = useTheme()

  const [customColor, setCustomColor] = useState('#ff6b35')

  const predefinedColors = [
    { name: 'Orange', value: '#ff6b35', hsl: { h: 23, s: 85, l: 56 } },
    { name: 'Blue', value: '#3b82f6', hsl: { h: 217, s: 91, l: 60 } },
    { name: 'Green', value: '#10b981', hsl: { h: 158, s: 64, l: 52 } },
    { name: 'Purple', value: '#8b5cf6', hsl: { h: 258, s: 90, l: 66 } },
    { name: 'Pink', value: '#ec4899', hsl: { h: 330, s: 81, l: 60 } },
    { name: 'Red', value: '#ef4444', hsl: { h: 0, s: 84, l: 60 } },
  ]

  const handleColorChange = (colorValue: string) => {
    const color = predefinedColors.find((c) => c.value === colorValue)
    if (color) {
      setPrimaryColor(color.hsl)
    }
  }

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setCustomColor(color)
    setPrimaryColor(color)
  }

  const getDarkModeIcon = () => {
    switch (darkMode) {
      case 'auto':
        return <Laptop className="lem-h-4 lem-w-4" />
      case 'manual':
        return isDark ? (
          <Moon className="lem-h-4 lem-w-4" />
        ) : (
          <Sun className="lem-h-4 lem-w-4" />
        )
      case 'disabled':
        return <Sun className="lem-h-4 lem-w-4" />
      default:
        return <Laptop className="lem-h-4 lem-w-4" />
    }
  }

  return (
    <Card className="lem-w-full lem-max-w-md">
      <CardHeader>
        <CardTitle className="lem-flex lem-items-center lem-gap-2">
          <Palette className="lem-h-5 lem-w-5" />
          Theme Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="lem-space-y-4">
        {/* Dark Mode Controls */}
        <div className="lem-space-y-2">
          <label className="lem-text-sm lem-font-medium">Dark Mode</label>
          <div className="lem-flex lem-gap-2">
            <Button
              variant={darkMode === 'disabled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDarkMode(false)}
              className="lem-flex lem-items-center lem-gap-1"
            >
              <Sun className="lem-h-3 lem-w-3" />
              Light
            </Button>
            <Button
              variant={isDark && darkMode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDarkMode(true)}
              className="lem-flex lem-items-center lem-gap-1"
            >
              <Moon className="lem-h-3 lem-w-3" />
              Dark
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              className="lem-flex lem-items-center lem-gap-1"
            >
              {getDarkModeIcon()}
              Toggle
            </Button>
          </div>
          <p className="lem-text-xs lem-text-muted-foreground">
            Current: {darkMode} mode, {isDark ? 'dark' : 'light'} theme
          </p>
        </div>

        {/* Primary Color Selection */}
        <div className="lem-space-y-2">
          <label className="lem-text-sm lem-font-medium">Primary Color</label>
          <Select onValueChange={handleColorChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a color" />
            </SelectTrigger>
            <SelectContent>
              {predefinedColors.map((color) => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="lem-flex lem-items-center lem-gap-2">
                    <div
                      className="lem-w-4 lem-h-4 lem-rounded lem-border"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Custom Color Picker */}
        <div className="lem-space-y-2">
          <label className="lem-text-sm lem-font-medium">Custom Color</label>
          <div className="lem-flex lem-gap-2 lem-items-center">
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="lem-w-12 lem-h-8 lem-rounded lem-border lem-border-input lem-cursor-pointer"
            />
            <input
              type="text"
              value={customColor}
              onChange={(e) => setCustomColor(e.target.value)}
              className="lem-flex-1 lem-px-3 lem-py-1 lem-text-sm lem-border lem-border-input lem-rounded lem-bg-background"
              placeholder="#ff6b35"
            />
          </div>
        </div>

        {/* Current Theme Info */}
        <div className="lem-space-y-2">
          <label className="lem-text-sm lem-font-medium">Current Theme</label>
          <div className="lem-p-3 lem-bg-muted lem-rounded lem-text-xs lem-space-y-1">
            <div>
              Mode: <span className="lem-font-mono">{darkMode}</span>
            </div>
            <div>
              State:{' '}
              <span className="lem-font-mono">{isDark ? 'dark' : 'light'}</span>
            </div>
            <div>
              Primary:{' '}
              <span className="lem-font-mono">
                {primaryColor &&
                  (typeof primaryColor === 'object'
                    ? `hsl(${primaryColor.h}, ${primaryColor.s}%, ${primaryColor.l}%)`
                    : primaryColor || 'default')}
              </span>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={resetTheme}
          className="lem-w-full"
        >
          Reset to Default
        </Button>
      </CardContent>
    </Card>
  )
}
