"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slackTextHandler_1 = __importDefault(require("./slackTextHandler"));
const axios_1 = __importDefault(require("axios"));
const slackHandler = new slackTextHandler_1.default(axios_1.default);
exports.default = (app) => {
    app.get('/stock', async (req, res) => {
        const message = JSON.stringify(req.body);
        await slackHandler.sendMsg(message);
    });
    app.use('/execute', async (req, res) => {
        const command = req.body.command;
        const user = req.body.user_name;
        const channel = req.body.channel;
        await slackHandler.sendMsg(`Executando comando ${command} pelo usuário ${user} no canal #${channel}`);
    });
    app.use('/send', async (req, res) => {
        await slackHandler.sendMsg(`Executando comando ${req.body.command}`);
        return res.send('command /send sucessufuly executed!');
    });
    app.get('/json', async (req, res) => {
        return res.status(200).json({
            message: 'executed json endpoint',
            code: 200,
            sucess: true
        });
    });
};
