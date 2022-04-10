# SmartCityMap

**SmartCityMap** is a **Node.js** application which uses **Express.js**.
This application is built for visualize data on a map. The data source is changeable, the data structure is fixed and in **JSON** format.
There is a coordinate-generator also built into the application to have various numbers of sample data on the map.

## Usage

### Clone the repository (you must have Git installed on your computer [or you can download the project in .zip])

    git clone https://github.com/ekrisz/smartcitymap.git

### Run the application

##### The application can be run in different ways (in local or you can deploy it to e.g. Heroku [this way is not described here])

 #### With Docker (you must have Docker installed on your computer)

 1. navigate to the project folder
 2. `docker compose build`
 3. `docker compose up`
 4. to stop and remove the created containers: `docker compose down -v`

#### Without Docker (you must have Node.js installed on your computer)

 1. navigate into the project/app folder
 2. `npm install`
 3. `npm start`

### Open in browser
#### The application
    http://localhost:3000
#### Prometheus (only if you use the app from Docker)
    http://localhost:9000
