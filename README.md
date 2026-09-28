# MASAR — Jordan Tourism 🇯🇴

An interactive tourism website designed to help visitors discover and explore Jordan through personalized travel experiences and an AI-powered tourism guide.

MASAR combines destination discovery, a personalized **Experience Finder**, and a friendly **AI Guide** into a simple and engaging tourism experience.

The visual language follows the provided ROOTS design references: warm cream backgrounds, an editorial serif (**Fraunces**) paired with **Inter**, a terracotta accent, and pill-shaped chips and buttons.

## ✨ Features

* 🇯🇴 **Jordan Tourism Discovery** — Explore destinations and experiences across Jordan.
* 🧭 **Experience Finder** — Answer five quick questions and receive personalized recommendations.
* 🤖 **AI Guide** — Ask MASAR questions about Jordan through an interactive AI tourism assistant.
* 👀 **Animated AI Character** — The guide reacts to typing, messages, thinking, and responses.
* ☁️ **Speech Cloud Responses** — AI answers appear as friendly cartoon-style speech clouds.
* 📍 **Destination Filtering** — Explore experiences based on location.
* 🎯 **Personalized Recommendations** — Experiences are matched according to the visitor's preferences.
* 📱 **Responsive Design** — Designed to work across desktop, tablet, and mobile screens.
* 🎨 **Editorial Tourism Design** — Warm, modern visual language inspired by the provided ROOTS references.

## 📁 Structure

```text
jordan-tourism/

├── index.html          Home — hero, storytelling, destinations, Petra & Amman features
├── explore.html        Plan Your Trip — multi-step Experience Finder + results
├── ai.html             AI Guide — "Ask MASAR" animated character + chat

├── css/
│   ├── style.css       Shared design tokens, components, and responsive styles
│   └── ai.css          AI Guide page styles

├── js/
│   ├── main.js         Navigation, scroll reveal, experience data,
│   │                    matching algorithm, finder, results, modal, and toast
│   └── ai.js           AI Guide chat, eye/mood animation, and sample answers

└── README.md
```

## 🚀 Running It

MASAR is currently a static HTML/CSS/JavaScript project.

No build tools, frameworks, or installation steps are required.

You can either open:

```text
index.html
```

directly in a browser, or serve the project locally.

For example:

```bash
python3 -m http.server
```

Then open:

```text
http://localhost:8000
```

## 🧭 Experience Finder

The **Experience Finder** is available on:

```text
explore.html
```

It uses a five-step quiz to understand what the visitor is looking for.

The experience data is stored in:

```text
js/main.js
```

The dataset is called:

```javascript
EXPERIENCES
```

Each experience contains information such as:

* Location
* Interests
* Time needed
* Walking level
* Budget tier

After the visitor completes the five steps, the answers are compared against the available experiences using:

```javascript
getRecommendations()
```

The top three matching experiences are then displayed as cards.

### Destination Links

Destination cards on the homepage can link directly to the Experience Finder with a selected location.

For example:

```text
explore.html?loc=<destination>
```

The selected destination is then used to pre-fill the location step.

All recommendation matching happens **client-side** using the in-memory experience dataset.

No backend or network request is required for the Experience Finder.

---

## 🤖 AI Guide

The AI Guide is available on:

```text
ai.html
```

The page is designed to feel like a friendly digital tourism companion rather than a traditional technical chatbot.

Visitors can simply type a question and ask MASAR about Jordan.

Examples include:

* "What should I visit in Amman?"
* "What can I do in Madaba?"
* "What Jordanian food should I try?"
* "Can you plan a day trip for me?"
* "Tell me about Petra."
* "What can I do in Jordan?"

### 👀 Animated Character

The AI character is interactive and responds to the visitor's actions.

The animation is controlled by:

```text
js/ai.js
```

The character uses the CSS variables:

```text
--look-x
--look-y
```

on:

```text
#ai-character
```

Different interaction states change the character's eye direction:

* **Idle** — looks toward the visitor.
* **Typing** — looks down toward the chat input.
* **Sending** — looks toward the new message.
* **Thinking** — glances around naturally.
* **Answering** — looks toward the response cloud before returning to the visitor.

The movement is designed to be subtle and friendly.

### ☁️ Speech Cloud Responses

AI responses appear as animated cartoon-style speech clouds rather than traditional rectangular chatbot messages.

The response:

1. Appears after the thinking state.
2. Pops upward with a small animation.
3. Uses a cloud/speech-bubble design.
4. Displays the AI's tourism response.
5. Keeps the conversation flowing naturally.

This gives the AI Guide a more welcoming and character-driven experience.

---

## 💬 AI Responses

The current AI Guide includes sample responses for demonstration.

The configuration is located in:

```javascript
js/ai.js
```

The default configuration uses:

```javascript
CONFIG.useMockReplies = true
```

Sample responses are stored in:

```javascript
MOCK_RULES
```

The rules use keywords to determine an appropriate sample tourism response.

These responses can be edited directly in `js/ai.js`.

---

## 🔌 Connecting a Real AI

The AI Guide is structured so that a real AI backend can be connected later.

Set:

```javascript
CONFIG.useMockReplies = false
```

and configure:

```javascript
CONFIG.apiUrl
```

to point to your backend endpoint.

The frontend sends a request containing:

```json
{
  "messages": [
    {
      "role": "user",
      "content": "What should I visit in Jordan?"
    }
  ]
}
```

The expected response format is:

```json
{
  "reply": "Jordan has many amazing places to explore...",
  "link": {
    "href": "...",
    "label": "Explore this place"
  }
}
```

The `link` property is optional.

### 🔐 API Security

If a real AI provider is connected, the provider's secret API key must remain on the backend.

**Never place an AI provider API key inside browser JavaScript.**

The backend should handle communication with the AI provider and return only the required response to the MASAR frontend.

---

## 🎨 AI Character

The current AI character is implemented as an inline SVG inside:

```text
ai.html
```

This allows the eye animation to interact directly with the character.

To replace it with custom artwork, the SVG can be replaced with an image such as:

```html
<img src="assets/masar-ai.png" alt="MASAR AI Guide">
```

while keeping the:

```text
#ai-character
```

wrapper.

The existing floating animation and speech-cloud experience can remain in place.

The eye-tracking animation requires the SVG implementation.

---

## 🖼️ Images

The current tourism imagery is hotlinked from **Wikimedia Commons**, including photographs related to:

* Petra
* Wadi Rum
* Amman
* Dead Sea
* Aqaba
* Jerash

Because these images are loaded remotely, an internet connection is required for the photographs to appear.

The image sources can be replaced with locally stored assets if required.

A local structure such as:

```text
assets/
└── images/
```

can be used for locally hosted images.

---

## 🎨 Design System

MASAR follows the visual language established by the provided ROOTS design references.

The main design characteristics include:

* Warm cream backgrounds
* Terracotta accent color
* Editorial **Fraunces** typography
* **Inter** for supporting text
* Rounded pill-shaped buttons
* Rounded cards
* Clean editorial layouts
* Large tourism imagery
* Subtle animations
* Responsive layouts

The AI Guide extends this design system with:

* Friendly character artwork
* Animated eyes
* Chat interactions
* Thinking states
* Cartoon speech clouds

---

## 📱 Responsive Design

The website is designed to adapt to different screen sizes.

The shared stylesheet includes responsive behavior for smaller screens, including layouts down to approximately **390px** wide.

The AI Guide also adapts its:

* Character size
* Chat layout
* Message bubbles
* Input area
* Suggestion buttons

for smaller screens.

---

## 🗺️ Current Pages

### Home

```text
index.html
```

The homepage contains:

* Hero section
* Jordan tourism storytelling
* Destination discovery
* Petra feature
* Amman feature
* Navigation to the Experience Finder and AI Guide

### Plan Your Trip

```text
explore.html
```

Contains the five-step Experience Finder and personalized recommendations.

### AI Guide

```text
ai.html
```

Contains the **Ask MASAR** AI tourism experience with:

* Interactive AI character
* Animated eyes
* Chat interface
* Thinking state
* Cartoon speech clouds
* Sample tourism responses

---

## 🧪 Testing Checklist

Before publishing, test the following:

### Home

* Navigation links
* Destination cards
* Scroll animations
* Responsive layout
* Images loading correctly

### Experience Finder

* All five steps
* Back/Next navigation
* Location selection
* Preference selection
* Recommendation matching
* Top three results
* Destination pre-filling
* Mobile layout

### AI Guide

* Chat input
* Send button
* Enter-to-send
* Empty message handling
* Multiple messages
* Typing eye movement
* Thinking animation
* Speech cloud animation
* Long responses
* Mobile layout

---

## 🧭 Project Vision

MASAR aims to make discovering Jordan simpler, more personal, and more interactive.

Instead of asking every tourist to search through large amounts of information, MASAR helps visitors discover experiences based on what they actually want.

By combining:

**Tourism Discovery + Personalization + AI**

MASAR creates a more engaging way for visitors to explore Jordan.

> **Discover Jordan your way.**

---

## 👥 Project

**MASAR — Jordan Tourism 🇯🇴**

An interactive tourism web project focused on making Jordan easier and more engaging to discover.

---

## 📄 License

No license has been specified yet.
