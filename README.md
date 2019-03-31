# SSM Agent Menu UI  

This project deploys a simple Angular 4 app in IBM Bluemix. The Angular 4 uses the [angular-cli](https://github.com/angular/angular-cli) to generate the application artifacts into the **dist** folder. Once generated, these artifacts are deployed to IBM Bluemix and served by the [Cloud Foundry static buildpack](https://github.com/cloudfoundry/staticfile-buildpack).

## Running the app on Bluemix

1. Create a Bluemix Account

    [Sign up][bluemix_signup_url] for Bluemix, or use an existing account.

2. Download and install the [Cloud-foundry CLI][cloud_foundry_url] tool

3. Clone the app to your local environment from your terminal using the following command

  ```
  git clone https://ghe.aa.com/AA-CustTech-Fly/aa-ct-fly-ssmagentmenu-ui.git
  ```

4. Cd into this newly created directory

1. Install [angular-cli](https://github.com/angular/angular-cli)

  ```
  npm install -g angular-cli
  ```

1. Install the project dependencies

  ```
  npm install
  ```

1. Build the project

  ```
  npm run dist
  ```

  This task defined in [package.json](package.json) compiles the Angular 4 app. In addition it copies the [manifest.yml](manifest.yml) file to the **dist** directory together with the [Staticfile](Staticfile). Those two are needed to deploy the **dist** folder with the [Cloud Foundry static buildpack](https://github.com/cloudfoundry/staticfile-buildpack) making it possible to serve plain HTML, CSS, JavaScript files.

1. Change to the dist directory

  ```
  cd dist
  ```

1. Push the application to Bluemix

  ```
  cf push
  ```

  It will create a new app named *aa-ct-fly-ssmpriority-ui* with a random route. Watch for the route name in the ```cf push``` output.


This project was generated with [angular-cli](https://github.com/angular/angular-cli) version 1.6.1.

## Troubleshooting

To troubleshoot your Bluemix app the main useful source of information is the logs. To see them, run:

  ```
  cf logs <application-name> --recent
  ```

---

This project is a sample application created for the purpose of demonstrating the deployment of a Angular 4 app in IBM Bluemix.
