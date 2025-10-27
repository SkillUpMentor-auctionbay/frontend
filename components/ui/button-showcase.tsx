"use client"

import * as React from "react"
import { Button } from "./button"
import { Icon } from "./icon"


export function ButtonShowcase() {
  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <div>
        <h1 className="text-2xl font-bold mb-6 text-foreground">Button Variations</h1>

        {/* Regular Buttons */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Regular Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="tertiary">Tertiary Button</Button>
            <Button variant="alternative">Alternative Button</Button>
          </div>
        </section>

        {/* Buttons with Left Icons */}
        <section className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-foreground">Buttons with Left Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" leftIcon="Add">
              Add Item
            </Button>
            <Button variant="secondary" leftIcon="Notifications none">
              Notifications
            </Button>
            <Button variant="tertiary" leftIcon="Home">
              Home
            </Button>
            <Button variant="alternative" leftIcon="Search">
              Search
            </Button>
          </div>
        </section>

        {/* Buttons with Right Icons */}
        <section className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-foreground">Buttons with Right Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" rightIcon="Chevron right">
              Continue
            </Button>
            <Button variant="secondary" rightIcon="Location">
              Location
            </Button>
            <Button variant="tertiary" rightIcon="Eye">
              View Details
            </Button>
            <Button variant="alternative" rightIcon="Edit">
              Edit
            </Button>
          </div>
        </section>

        {/* Buttons with Both Icons */}
        <section className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-foreground">Buttons with Both Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" leftIcon="Check" rightIcon="Chevron right">
              Complete
            </Button>
            <Button variant="secondary" leftIcon="Eur" rightIcon="Trending up">
              Pricing
            </Button>
            <Button variant="tertiary" leftIcon="Time" rightIcon="Edit">
              Schedule
            </Button>
            <Button variant="alternative" leftIcon="Person" rightIcon="Settings">
              Profile
            </Button>
          </div>
        </section>

        {/* CTA Buttons */}
        <section className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-foreground">CTA Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button buttonStyle="cta" variant="primary" icon="Add" />
            <Button buttonStyle="cta" variant="secondary" icon="Notifications none" />
            <Button buttonStyle="cta" variant="alternative" icon="Home" />
          </div>
        </section>

        {/* CTA Buttons with Different Sizes */}
        <section className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-foreground">CTA Buttons - Different Sizes</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Small</p>
              <Button buttonStyle="cta" variant="primary" size="sm" icon="Add" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Default</p>
              <Button buttonStyle="cta" variant="primary" icon="Add" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Large</p>
              <Button buttonStyle="cta" variant="primary" size="lg" icon="Add" />
            </div>
          </div>
        </section>

        {/* Icon Grid */}
        <section className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-foreground">Available Icons</h2>
          <div className="grid grid-cols-8 gap-4">
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Add" size={24} />
              <span className="text-xs text-muted-foreground">Add</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Notifications none" size={24} />
              <span className="text-xs text-muted-foreground">Notifications</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Home" size={24} />
              <span className="text-xs text-muted-foreground">Home</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Chevron right" size={24} />
              <span className="text-xs text-muted-foreground">Chevron</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Location" size={24} />
              <span className="text-xs text-muted-foreground">Location</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Eye" size={24} />
              <span className="text-xs text-muted-foreground">Eye</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Check" size={24} />
              <span className="text-xs text-muted-foreground">Check</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Edit" size={24} />
              <span className="text-xs text-muted-foreground">Edit</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Eur" size={24} />
              <span className="text-xs text-muted-foreground">EUR</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Trending up" size={24} />
              <span className="text-xs text-muted-foreground">Trending</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Settings" size={24} />
              <span className="text-xs text-muted-foreground">Settings</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Time" size={24} />
              <span className="text-xs text-muted-foreground">Time</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Delete" size={24} />
              <span className="text-xs text-muted-foreground">Delete</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Search" size={24} />
              <span className="text-xs text-muted-foreground">Search</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Icon name="Person" size={24} />
              <span className="text-xs text-muted-foreground">Person</span>
            </div>
          </div>
        </section>

        {/* Standalone Icons */}
        <section className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-foreground">Standalone Icons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Icon name="Add" size={16} />
              <span className="text-sm text-muted-foreground">16px</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Search" size={20} />
              <span className="text-sm text-muted-foreground">20px</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Home" size={24} />
              <span className="text-sm text-muted-foreground">24px</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Settings" size={32} />
              <span className="text-sm text-muted-foreground">32px</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Check" size={40} />
              <span className="text-sm text-muted-foreground">40px</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Person" className="w-8 h-8" />
              <span className="text-sm text-muted-foreground">Custom class</span>
            </div>
          </div>
        </section>

        {/* Button States */}
        <section className="space-y-4 mt-8">
          <h2 className="text-lg font-semibold text-foreground">Button States</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Enabled State</p>
              <div className="flex gap-4">
                <Button variant="primary">Enabled</Button>
                <Button buttonStyle="cta" variant="primary" icon="Add" />
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Disabled State</p>
              <div className="flex gap-4">
                <Button variant="primary" disabled>Disabled</Button>
                <Button buttonStyle="cta" variant="primary" icon="Add" disabled />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}