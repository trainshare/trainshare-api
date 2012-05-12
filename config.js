module.exports = {
    twitter: {
        consumer_key: "",
        consumer_secret: "",
        access_token: "",
        acces_token_secret: ""
    },
    mysql: {
        user: process.env.MYSQL_USER ? process.env.MYSQL_USER : 'root',
        password: process.env.MYSQL_PASSWORD ? process.env.MYSQL_PASSWORD : '',
        database: process.env.MYSQL_DATABASE ? process.env.MYSQL_DATABASE : 'trainsharing',
        port: process.env.MYSQL_PORT ? process.env.MYSQL_PORT : 3306,
        host: process.env.MYSQL_HOST ? process.env.MYSQL_HOST : 'localhost'
    },
    neo4j: {
        url: process.env.NEO4J_URL || "http://localhost:7474"
    }
}
