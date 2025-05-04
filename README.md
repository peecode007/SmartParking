# Smart Parking System

## Firmware

- Emulation done in QEMU
- Dockerfile from https://github.com/mluis/qemu-esp32

### TL;DR

```
$ docker run -it -p 8080:80 --rm qemu-esp32
$ idf
$ idf.py build -C program
$ ./flash.sh program/build/emulation.bin
$ qemu-system-xtensa -nographic -M esp32 -m 4 -drive file=flash.bin,if=mtd,format=raw -nic user,model=open_eth,hostfwd=tcp::80-:80
```

### Optional Config before building firmware

```
$ idf.py build -C program menuconfig
```

### Building container

```
$ docker build . -t qemu-esp32
```

---

## Application

### Overview

The Smart Parking System is an innovative solution to optimize parking space management using real-time data collection and IoT devices. This system helps users find available parking spaces in real-time, while also providing management tools for parking lot owners. The system leverages sensors, mobile applications, and cloud computing to provide a seamless experience for both users and parking providers.

### Features

* **Real-time Parking Availability**: Users can view available parking spaces in real-time via a mobile app or web interface.
* **Automated Parking Space Monitoring**: Sensors detect whether parking spaces are occupied or vacant.
* **Parking Reservation**: Users can reserve a parking space in advance to avoid searching for parking.

### Technologies Used

* **Backend & Frontend**: Next.js (React.js with API Routes)
* **Database**: MongoDB

### Installation

#### Prerequisites

* Node.js (v15+)
* MongoDB or MongoDB Atlas account

#### Setup Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/smart-parking.git
   cd smart-parking
   ```

2. **Setup Next.js (Frontend & Backend):**:

   Install the dependencies:

   ```bash
   npm install
   ```

   * Configure the database connection (MongoDB URI) in `.env` file.
   * Start the server:
3. **Configure the Environment:**:

    Create a .env.local file in the root directory with the necessary environment variables, such as MongoDB URI and API keys for payment gateways.

    Example .env.local:
    ```bash
    MONGODB_URI=your-mongo-uri
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=your-nextauth-secret
    ```

3. **Start the server:**:

    ```bash
    npm run dev
    ```

### Usage

#### For Users

1. **Sign up** on the website.
2. **Reserve a parking space** if needed.

#### For Parking Lot Owners

1. **Login** to the admin panel.
2. **Monitor parking lot occupancy** in real-time.
3. **Manage pricing** and parking slots.

### Contributing

We welcome contributions to improve the Smart Parking System! Please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Make your changes and commit (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a Pull Request for review.


### Acknowledgments

* Inspired by modern parking management systems and real-time location-based services.
