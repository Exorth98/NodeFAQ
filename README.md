# Node FAQ Project

## Description

**A project for Web Application Architecture course, consisting on a FAQ/forum**

This project run a NodeJS server rendering pages using EJS.
Some parts of the website is rendering in real-time using the cooperation of React and Socket.io.

## Usage

To test the project you need to :
- Clone the repository
    ```
    git clone https://github.com/Exorth98/NodeFAQ.git
    ```
- Add a ```sendgridkey.json``` file in the ```/config``` folder with a sendgrid API key (for sending verification emails):
    ```
    {
        "SENDGRID_API_KEY" : "Your api key"
    }
    ```

- Install librairies:
    ```
    npm i
    ```

- Run the server:
    ```
    node index
    ```

**The server is now running and accessible on http://localhost:3000**
