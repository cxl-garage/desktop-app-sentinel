# Sentinel Desktop Application

An open source desktop application that allows users to execute Conservation X Lab’s image processing models locally via a user-friendly UI.

## Current Status

This app is currently in development and not yet production ready.

## Project Description

CXL produces Sentinel hardware and a Sentinel web app to allow conservation organizations to capture and process images in order to identify wildlife. To make CXL’s models accessible to conservation teams in the field, to users with limited command-line expertise, and to organizations that already possess a large host of images requiring processing, CXL has partnered with Two Sigma Data Clinic to build an open source desktop app that facilitates local imaging processing via a user-friendly UI.

## Pre-requisites

- Python version `3.10.2` or above
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Local setup

1. After cloning and going into repo, run `yarn install`
2. Initiliaze the local sqlite db by running `yarn make-db`
3. To start the app, run `yarn start`

## License

[Apache 2.0](LICENSE)

## Contributors

[Conservation X Labs](https://conservationxlabs.com/)' Sentinel team. Contact: [sentinel-support@conservationxlabs.org](mailto:sentinel-support@conservationxlabs.org)

[Data Clinic](https://www.twosigma.com/data-clinic/), the pro bono data and tech-for-good arm of Two Sigma. Contact: [dataclinic@twosigma.com](mailto:dataclinic@twosigma.com), GitHub: https://github.com/tsdataclinic

## Known Issues

The team is aware of the following issues and is actively addressing them:

**General Function**

- System warnings are expected while downloading and installing the app, these will be resolved once the app is officially released
- When in dark mode, if the sidebar is collapsed then expanded the toggle resets and appears to be set to light mode despite still having the dark mode color scheme.

**Run Your Model**

- Config files are not displayed when using Windows Explorer, causing difficulty when selecting the proper model folder
- Attempting runs without "Import dataset" or "Save results to" selected can cause errors or unexpected results

**Logs**

- Downloading the logs file does not match exactly with the logs shown in the app

## Packaging the app

The app can be packaged with `yarn package`. More details, such as how to manage Prisma binary versions when packaging, can be found in the [Developer Documentation](https://github.com/cxl-garage/desktop-app-sentinel/wiki/Developer-Documentation#packaging-the-app).
