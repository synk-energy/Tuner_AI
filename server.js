import express from 'express';
import * as dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Configuration, OpenAIApi } from 'openai';
import bodyParser from 'body-parser';

dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'))
app.use(bodyParser.urlencoded());
app.use(cookieParser());


app.post('/api/prompt', async (req, res) => {
  try {
    const prompt = req.body.prompt;

    // get password cookie from res
    const password = req.cookies.password;

    // check if password is correct
    if (password != process.env.PASSWORD) {
      // delete cookie
      res.clearCookie('password');

      res.status(302)
        .header('Location', '/login.html?error=true')
        .send();
    };

    let configuration = JSON.parse(req.cookies.configuration);
    let prefix = `Tuner, on a ${configuration.year} ${configuration.make} ${configuration.model}`;

    if (configuration.part) {
      prefix += ` when working on the ${configuration.part}`;
    }

    let full_prompt = `${prefix} ${prompt}`;

    // Tuner, on a
    // (make/model/year)
    // when working on the the
    // (part type/sub type)

    console.log("Calling with prompt: ", full_prompt);

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${full_prompt}`,
      temperature: 0.45,
      max_tokens: 2688,
      top_p: 0.54,
      frequency_penalty: 0.5,
      presence_penalty: 0
    });

    res.status(200).send({
      response: response.data.choices[0].text
    })
  } catch (error) {
    console.log(error);
    res.status(500).send({ error })
  }
})

app.post('/api/login', async (req, res) => {
  let password = req.body.password;

  if (password == process.env.PASSWORD) {
    res.cookie('password', password, { maxAge: 2678400000, sameSite: 'none', secure: true });

    res.status(302)
      .header('Location', '/index.html')
      .send();
  } else {
    res.status(302)
      .header('Location', '/login.html?error=true')
      .send();
  }
})

app.listen(process.env.PORT || 5000, () => console.log(`server is listening on http://localhost:${process.env.PORT || 5000}`));


export default app;
