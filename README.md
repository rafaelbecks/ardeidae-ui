# Ardeidae UI

## Overview
**Ardeidae UI** is a configuration and calibration tool designed for the Ardeidae system. It is built using **Lit** and **Three.js**, providing an interactive interface for visualizing and adjusting accelerometer-based motion data in real time.

The core logic of Ardeidae is implemented in the [Ardeidae Logic Repository](https://github.com/rafaelbecks/ardeidae).

## Features
- **3D Hand Model Rendering:** Uses Three.js to display and manipulate a 3D model of a hand.
- **OSC Message Handling:** Listens for Open Sound Control (OSC) messages to adjust the hand model’s rotation based on accelerometer data.
- **Calibration Functionality:** Allows users to calibrate the model’s position.
- **Minimal UI:** Built with **LitElement** for a lightweight and modular web component-based interface.

## Installation
### Prerequisites
Ensure you have **Node.js** installed on your system.

### Clone the repository:
```sh
$ git clone https://github.com/your-repo/ardeidae-ui.git
$ cd ardeidae-ui
```

### Install dependencies:
```sh
$ npm install
```

## Usage
### Start the development server:
```sh
$ npm start
```
This will run the application using **web-dev-server**.

## Build
To create a production-ready build:
```sh
$ npm run build
```

## License
This project is licensed under the **MIT License**.

## Author
Developed by **Rafael Becerra**.
