Feature: Test User Roles for Management

	Scenario: Log into Portal
		Given User logs in with role "management"

	Scenario: Access rights to Screen1
		When User attempts to access "Screen1"
		Then User should be able to view
		And User should be able to delete
		And User should be able to edit
	Scenario: Access rights to Screen2
		When User attempts to access "Screen2"
		Then User should be able to view
		And User should be able to delete
		And User should be able to edit
	Scenario: Access rights to Screen3
		When User attempts to access "Screen3"
		Then User should be able to view
		And User should be able to delete
		And User should be able to edit
