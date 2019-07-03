<template>
    <div>
        <div>
            <input type="text" v-model="host" placeholder="Host">
            <input type="number" v-model="port" placeholder="Port">
            <input type="text" v-model="user" placeholder="user">
            <select v-model="type">
                <option value="ftp">ftp</option>
                <option value="sftp">sftp</option>
            </select>
            <input type="password" v-model="password" placeholder="Password">
            <button @click="connect">connect</button>
        </div>
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
</template>
<script>
import Client from './components/Client'
import uniqid from 'uniqid'
import ClientFactory from './Client'
export default {
    name: 'app',
    components: {
        Client
    },
    data () {
        return {
            clients: [],
            port: 22,
            type: 'sftp',
            host: '',
            user: '',
            password: ''
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