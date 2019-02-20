/**
 * Created by Administrator on 2019/2/15.
 */

const yargs = require("yargs");
const dotenv = require("dotenv");
dotenv.config();
yargs
    .locale('zh_CN')
    .commandDir(__dirname + '/command', {
        extensions: ['js', 'ts']
    })
    .demandCommand()
    .alias('h', 'help')
    .help()
    .argv;
