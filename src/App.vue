<template>
    <div class="app">
        <div class="toolbar">
            <custom-input type="text" v-model="host"  placeholder="Host" />
            <custom-input type="number" v-model="port" placeholder="Port" />
            <custom-input type="text" v-model="user" placeholder="user" />
            <select v-model="type">
                <option value="ftp">ftp</option>
                <option value="sftp">sftp</option>
            </select>
            <custom-input type="password" v-model="password" placeholder="Password" />
            <button @click="connect">CONNECT</button>
        </div>
        <div class="clients">
            <client
                v-for="(client, index) in clients"
                :key="index"
                :id="client.id"
                :type="client.type"
                :host="client.host"
                :port="client.port"
                :user="client.user"
                :password="client.password"
                :client="client.client"
                @close="close"
            />
        </div>
    </div>
</template>
<script>
import Client from './components/Client'
import uniqid from 'uniqid'
import ClientFactory from './Client'
import dotenv from 'dotenv-flow'


dotenv.config()
// eslint-disable-next-line

const TYPE     = process.env.EFTIPI_TYPE || ''
const HOST     = process.env.EFTIPI_HOST || ''
const USER     = process.env.EFTIPI_USER || ''
const PASSWORD = process.env.EFTIPI_PASSWORD || ''
// eslint-disable-next-line 
console.log(process.env)

export default {
    name: 'app',
    components: {
        Client
    },
    data () {
        return {
            clients: [],
            port: 21,
            type: TYPE,
            host: HOST,
            user: USER,
            password: PASSWORD
        }
    },
    methods: {
        connect () {
            this.clients.push({
                client: this.type === 'ftp' ? ClientFactory.ftp() : ClientFactory.sftp(),
                id: uniqid(),
                host: this.host,
                port: parseInt(this.port),
                user: this.user,
                password: this.password
            })
        },
        close (id) {
            const client = this.clients.find(c => c.id === id)
            client.client.end()
            client.client = null
            this.clients = this.clients.filter(c => c.id !== id)
        }
    }
}
</script>
<style lang="scss" scoped>
    .app {

        width: 100%;
        height: 100%;
        position:absolute;
        top: 0; left: 0; right: 0;
        display: flex;
        flex-direction: column;
        padding: 10px;

        
        custom-input {
            padding: 10px;
            height: 40px;
        }

        button {
            color: black;
            display: block;
            background: white;
            border: 1px solid #808080;
            padding: 5px;
            margin: 0;
            width: 200px;
            transition: all .5s ease;
            &:focus {
                transition: all .5s ease;
                outline: none;
                color: black;
                border: 1px solid black;
            }
        }

        .toolbar {
            position: relative;
            display: flex;
            justify-content: space-between;

        }

        .clients {
            flex-grow: 1;
            position: relative;
        }

    }
</style>
<style lang="scss">
    /*
    input[type=text], input[type=number], input[type=password] {
        margin: 0;
        background: white;
        color: black;
        border: none;
        position: relative;
        &:focus:before {
            width: 100%;
        }
        &:before {
            position: absolute;
            content: ' ';
            display: block;
            bottom: 0;
            height: 1px;
            color: black;
            width: 0;
        }
        &:after {
            content: ' ';
            position: absolute;
            display: block;
            bottom: 0;
            height: 1px;
            color: #c1c1c1;
            width: 100%;
        }

        &:focus {
            outline: none;
        }
        
    }
    */

    * {
        box-sizing: border-box;
        font-family: 'Roboto', sans-serif;
        font-weight: 300;
    }
    body, html {
        margin: 0;
        width: 100%;
        height: 100%;
        position: absolute;
    }
</style>
