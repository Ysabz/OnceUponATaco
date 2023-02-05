import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';
import path from 'path';
import { promises as fs } from 'fs';

dotenv.config();


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,

});

const openai = new OpenAIApi(configuration);
var db = "";
const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello From Codex',
    })
});

// higher temperature -> higher risk
// frequency penalty so that it does not generate the same thing often
// send two requests
app.post('/', async (req, res) => {
    try {
        const requestType = req.body.type;
        const prompt = req.body.prompt;
        if (requestType === 'completion') {
            db += " " + prompt;
            var command = "continue this story in 3 sentences and try to make it funny:" + db;
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `${command}`,
                temperature: 0.2,
                max_tokens: 3000,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
            });
            db += " " + response.data.choices[0].text;

            const dbDir = path.join(process.cwd(), 'db');
            const filedb = dbDir + '/test.txt';
            fs.writeFile(filedb, db);
            res.status(200).send({
                bot: response.data.choices[0].text
            })

        }
        else if (requestType === 'correction') {
            var command = "correct grammar mistakes in the text and replace [?] with the proper word:" + prompt;
            const response = await openai.createCompletion({
                model: "text-davinci-003",
                prompt: `${command}`,
                temperature: 0.2,
                max_tokens: 3000,
                top_p: 1,
                frequency_penalty: 0.5,
                presence_penalty: 0,
            });

            res.status(200).send({
                bot: response.data.choices[0].text
            })
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({ error });

    }
})



app.listen(5000, () => console.log('Server is running on port http://localhost:5000'))