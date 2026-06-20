# Signal of Trends

`Signal of Trends` is an interactive web experience that lets users receive and explore past trends through an old-fashioned television.

At the center of the screen is a retro TV that works like a small time machine. Users can turn one dial to choose an era, turn another dial to browse objects that were popular during that era, and press the `Power` button to turn on the screen. Once powered on, the selected era and object appear inside the cathode-ray tube display.

## Concept

This project began with the idea that the present self is built on layers of trends from the past.

Trends do not appear from nowhere. They are shaped by earlier tastes, technologies, objects, and lifestyles that keep changing over time. In this web experience, trends are presented not as a simple product list, but as traces of different eras received through a TV signal.

The text engraved in the top-left corner contains the central question of the project:

> What is trend to me?  
> What kind of trend are you following, and whose trend was it before yours?  
> Because there has always been a trend of trends, I believe the present me exists.

## Features

- Interactive retro television interface
- Black screen before the `Power` button is pressed
- Era and object display after the TV is powered on
- First dial for selecting an era
- Second dial for selecting an object from the selected era
- Browser-based memory for the last selected ERA and OBJECT dial positions
- Three.js-based TV body, antenna, stand, dials, button, and screen reflections
- CRT-style scanlines, glow, and vintage screen texture
- Responsive layout for different screen sizes

## Eras And Objects

The current project includes the following eras:

- `1970s`
- `1980s`
- `1990s`
- `2000s`
- `2010s`

Each era contains three objects. For example, the `1970s` era includes `Portable Record Player`, `Instant Camera`, and `Rotary Telephone`.

Object data is managed in the `eras` array inside [src/App.jsx](src/App.jsx).

## How To Use

### Power Button

The `Power` button turns the TV on and off.

- Off: the TV screen stays black, like an inactive CRT display.
- On: the currently selected era and object appear inside the TV screen.

### ERA Dial

The ERA dial changes the selected time period.

Each click moves to the next era.

### OBJECT Dial

The OBJECT dial changes the selected object within the current era.

Each click moves to the next object.

## Dial Memory

The last selected ERA and OBJECT dial positions are stored in the browser's `localStorage`.

Storage key:

```text
signal-of-trends:dial-memory
```

Stored value example:

```json
{
  "eraIndex": 0,
  "productIndex": 0,
  "updatedAt": "2026-06-20T00:00:00.000Z"
}
```

Because of this feature, the app can restore the last dial positions after a refresh or a later visit.

## Tech Stack

- React
- Vite
- Three.js
- Lucide React
- CSS
- localStorage

## Project Structure

```text
signal-of-trends/
├─ public/
├─ src/
│  ├─ App.jsx
│  ├─ App.css
│  ├─ index.css
│  └─ main.jsx
├─ index.html
├─ package.json
├─ package-lock.json
└─ README.md
```

## Getting Started

Install dependencies if they are not installed yet.

```powershell
npm.cmd install
```

Start the development server.

```powershell
npm.cmd run dev -- --host 127.0.0.1
```

Then open the app in the browser:

```text
http://127.0.0.1:5173/
```

On Windows, `npm.cmd` is recommended because the plain `npm` command can be blocked by PowerShell execution policy settings.

## Build

Create a production build with:

```powershell
npm.cmd run build
```

The built files will be generated in the `dist/` directory.

## Lint

Run the lint check with:

```powershell
npm.cmd run lint
```

## Development Notes

- Objects inside the TV screen are rendered only when `Power` is on.
- The TV shape and screen effects are created with both CSS and Three.js.
- Vite may show a bundle size warning because Three.js is included. This does not currently prevent the app from running.
- Dial memory currently uses browser local storage, not a server-side database.

## Possible Improvements

- Replace era objects with more culturally symbolic items
- Connect the dial memory to a real backend database
- Add a feature for users to submit their own trend objects
- Improve dial rotation animation
- Add dedicated interactions for each object inside the TV screen
