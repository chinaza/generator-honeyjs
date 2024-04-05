"use strict";
const Generator = require("yeoman-generator");
const chalk = require("chalk");
const yosay = require("yosay");

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(
        `Welcome to the awe-inspiring ${chalk.red(
          "generator-honeyjs"
        )} generator!`
      )
    );

    const prompts = [
      {
        type: "input",
        name: "packageName",
        message: "Your package name",
        default: "my-awesome-project" // Default to current folder name
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.fs.copyTpl(this.templatePath("honey"), this.destinationPath(this.props.packageName), {
      packageName: this.props.packageName
    }, undefined, {
      globOptions: {
        dot: true
      },
    });
  }

  install() {
    // CHECK OUT LATER: this.installDependencies();
  }
};
