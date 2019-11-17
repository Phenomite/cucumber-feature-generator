# CucumberJS Feature file generator for User Role Testing

## Generate static Gherkin syntax feature files based on a spreadsheet matrix of screen names and expected values against a list of users under test.

Forewarning - Not Safe for Behaviour Driven Development!

## Description

This generator was built to facilitate the easy extensibility of user role testing via a single spreadsheet rather than potentially editing hundreds of user "feature files" when using CucumberJS as a testing framework.

The gherkin language used can be simply edited across the entire project by editing the NodeJS generator script.

## Running via Pipeline

For enterprise Gitlab or other CI interfacing, run a stage to execute `npm run generate`.
