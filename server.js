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

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from Cyb3r Space',
  })
})

app.post('/', async (req, res) => {
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

    console.log("Calling with prompt: ", prompt);

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt}`,
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

app.post('/login', async (req, res) => {
  let password = req.body.password;

  if (password == process.env.PASSWORD) {
    res.cookie('password', password, { maxAge: 900000 });

    res.status(302)
      .header('Location', '/index.html')
      .send();
  } else {
    res.status(302)
      .header('Location', '/login.html?error=true')
      .send();
  }
})


app.listen(5000, () => console.log('server is running on port http://localhost:5000'));