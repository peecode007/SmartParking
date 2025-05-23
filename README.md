# Smart Parking System

- [Quick Start](#quick-start)
- [Firmware](#firmware)
  - [Deployment](#deployment)
  - [Development](#development)
- [Application](#application)
  - [Overview](#overview)
  - [Features](#features)
  - [Technologies Used](#technologies-used)
  - [Setup](#setup)
    - [Setup: Manual](#setup-manual)
    - [Setup: Docker](#setup-docker)
- [Usage](#usage)
  - [For Users](#for-users)
  - [For Parking Lot Owners](#for-parking-lot-owners)
- [Contributing](#contributing)

---

## Quick Start

```bash
$ docker-compose --profile prod up --build
```

---

## Firmware

- Emulation done in QEMU
- Original Dockerfile from [mluis/qemu-esp32](https://github.com/mluis/qemu-esp32)

### Deployment

- Building and running the ESP32 firmware in a docker container (with network named iot-network to allow connection to application)
```bash
# In firmware folder
$ docker build . -f .\Dockerfile_prod -t qemu-esp32-prod
$ docker run -it -p 8080:80 --rm --network iot-network qemu-esp32
```

### Development

- Building and running the development container to edit/compile ESP32 firmware
- ESP-IDF tools installed
- Here port `3000` is the port exposed by the application
```bash
# In firmware folder
$ docker build . -f .\Dockerfile_dev -t qemu-esp32-dev
$ docker run -it -p 8080:80 --rm --network iot-network qemu-esp32-dev
# In the docker container
$ idf
$ idf.py build -C program
$ ./flash.sh program/build/emulation.bin
$ qemu-system-xtensa -nographic -M esp32 -m 4 -drive file=flash.bin,if=mtd,format=raw -nic user,model=open_eth,hostfwd=tcp::80-:80,hostfwd=tcp::3000-:3000
```

---

## Application

### Overview

The Smart Parking System is an innovative solution to optimize parking space management using real-time data collection and IoT devices. This system helps users find available parking spaces in real-time, while also providing management tools for parking lot owners. The system leverages sensors, mobile applications, and cloud computing to provide a seamless experience for both users and parking providers.

### Features

* **Real-time Parking Availability**: Users can view available parking spaces in real-time via a web interface.
* **Automated Parking Space Monitoring**: Sensors detect whether parking spaces are occupied or vacant.
* **Parking Reservation**: Users can reserve a parking space in advance to avoid searching for parking.

### Technologies Used

* **Backend & Frontend**: Next.js (React.js with API Routes)
* **Database**: MongoDB

### Setup

* Node.js (v15+) or Docker
* MongoDB or MongoDB Atlas account

#### Setup: Docker

1. Build container
  ```bash
  cd application
  docker build -t nextjs-docker .
  ```

2. Create .env.local file to store secrets
    ```bash
    MONGODB_URI=your-mongo-db-uri
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-nextauth-secret
    PLATE_RECOGNIZER_API_KEY=your-plate-recognizer-api-key
    ```

3. Run container
  ```bash
  docker run --env-file .\.env.local -p 3000:3000 nextjs-docker
  ```

#### Setup: Manual

1. Install dependencies
  ```bash
  npm install
  ```

2. Create .env.local file to store secrets
  ```bash
  MONGODB_URI=your-mongo-db-uri
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=your-nextauth-secret
  PLATE_RECOGNIZER_API_KEY=your-plate-recognizer-api-key
  ```

3. Build for production
  ```bash
  npm run build
  ```

4. Start the server
  ```bash
  npm run start
  ```

---

## Usage

### For Users

1. **Sign up** on the website.
2. **Reserve a parking space** if needed.

### For Parking Lot Owners

1. **Login** to the admin panel.
2. **Monitor parking lot occupancy** in real-time.
3. **Manage pricing** and parking slots.

---

## Contributing

We welcome contributions to improve the Smart Parking System! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes and commit (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a Pull Request for review.

---
