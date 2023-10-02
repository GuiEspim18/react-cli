const arg = require("arg");
const inquirer = require('inquirer');
const fs = require("fs");
const { exit } = require("process");

class Cli {

    arg = "";
    args = (raw) => [
        {
            "--component": Boolean,
            "--styled": Boolean,
            "--c": "--component",
            "--s": "--styled",
            "--react-component": Boolean,
            "--rcc": "--react-component"
        },
        {
            argv: raw.slice(2)
        }
    ];

    constructor(arg) {
        this.arg = arg
        this.cli()
    }

    parse() {
        try {
            const parse = this.args(this.arg)
            const args = arg(parse[0], parse[1]);
            const obj = new Object();
            for (let item in args) {
                if (item !== "_") {
                    obj.template = item;
                } else obj.name = args[item][0];
            }
            return obj;
        } catch (error) {
            const code = error.code;
            this.error(code);
        }

    }

    async cli() {
        let opt = this.parse();
        opt = await this.prompt(opt);
        await this.createProject(opt);
    }

    async prompt(opt) {
        const quests = new Array();
        const list = {
            type: 'list',
            name: 'template',
            message: 'Please choose which option to use',
            choices: ['--styled', '--component', "--react-component"],
        };
        const name = {
            type: 'text',
            name: 'name',
            message: 'please choose a name:'
        };
        if (!opt.template) quests.push(list, name);
        const answers = await inquirer.prompt(quests);
        const obj = {
            ...opt,
            template: opt.template || answers.template,
            name: opt.name || answers.name
        };
        return obj;
    }

    async createProject(obj) {
        this.createFile(obj.name, obj.template);
    }

    createFile(name, template) {
        try {
            if (name === undefined) throw this.throwError("NO_NAME");
            const type = template.substring(2);
            const funcName = this.capitalizeFirstLetter(name);
            this.creatingFileByName(type, funcName);
        } catch (error) {
            this.error(error.code);
        }
    }


    creatingFileByName (type, funcName) {
        let fileName;
        let fileContent;
        if (type === "component") {
            fileName = `${funcName}.jsx`; 
            fileContent = `function ${funcName} () {\n    return(<></>);\n}\nexport default ${funcName};`;
            fs.appendFile(fileName, fileContent, (err) => {
                return err;
            });
            console.info(`File ${fileName} created`);
        }
        if (type === "styled") {
            fileName = `${funcName}.styled.jsx`; 
            fileContent = `import { styled } from "styled-components"\n\nexport const Styled${funcName} = styled.section` + "`\n\n`" ;
            fs.appendFile(fileName, fileContent, (err) => {
                return err;
            });
            console.info(`File ${fileName} created`);
        }
        if (type === "react-component") {
            const component = `${funcName}.jsx`; 
            const styled = `${funcName}.styled.jsx`;
            const componentContent = `import { Styled${funcName} } from "./${styled}";\n\nfunction ${funcName} () {\n    return(<></>);\n}\nexport default ${funcName};`;
            const styledContent =  `import { styled } from "styled-components"\n\nexport const Styled${funcName} = styled.section` + "`\n\n`";
            fs.mkdir(funcName, (err) => {
                if (err) return err;
                fs.writeFile(`${funcName}/${component}`, componentContent, (err) => {
                    return err;
                });
                fs.writeFile(`${funcName}/${styled}`, styledContent, (err) => {
                    return err
                });
            });
            console.info(`React component ${funcName} created`);
        }
    }


    throwError(code) {
        const error = new Error()
        error.code = code;
        return error
    }


    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }


    error(code) {
        switch (code) {
            case "ARG_UNKNOWN_OPTION":
                const arg = this.arg.slice(2);
                console.error(`Undefined argument: ${arg}`);
                break;
            case "NO_NAME":
                console.error("You need to provide a name");
                break;
            default:
                break;
        }
        exit(0);
    }

}

module.exports = Cli;