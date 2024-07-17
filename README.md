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

1. Clone repo
2. Set up `.env` file: `yarn reset-env`
3. Install all dependencies: `yarn install`
4. Initiliaze the local sqlite db: `yarn make-db`
5. Start the app: `yarn start`

## License

[Apache 2.0](LICENSE)

## Contributors

[Conservation X Labs](https://conservationxlabs.com/)' Sentinel team. Contact: [sentinel-support@conservationxlabs.org](mailto:sentinel-support@conservationxlabs.org)

[Data Clinic](https://www.twosigma.com/data-clinic/), the pro bono data and tech-for-good arm of Two Sigma. Contact: [dataclinic@twosigma.com](mailto:dataclinic@twosigma.com), GitHub: https://github.com/tsdataclinic

## Packaging the app

The app can be packaged with `yarn package`. More details, such as how to manage Prisma binary versions when packaging, can be found in the [Developer Documentation](https://github.com/cxl-garage/desktop-app-sentinel/wiki/Developer-Documentation#packaging-the-app).
