pipeline {
    agent any

    tools {
        jdk "jdk-17"
        maven "maven-3"
        nodejs "node-22"
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        APP_VERSION = "${BUILD_NUMBER}"
    }

    stages {

        stage('1. Checkout Code') {
             steps {

        dir('/workspace') {

            sh '''
                pwd
                ls -la
                ls docker
                ls docker/nginx
            '''
        }

    }
        }


        stage('2. Build Applications') {
            parallel {

                stage('Build Backend') {
                    steps {
                        echo '===== Build Backend ====='
                        dir('/workspace/backend') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }

                stage('Build API Gateway') {
                    steps {
                        echo '===== Build API Gateway ====='
                        dir('/workspace/api-gateway') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        echo '===== Build Frontend ====='
                        dir('/workspace/frontend') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('3. Build Docker Images') {
            steps {
                echo '===== Build Docker Images ====='

                sh 'docker build -t pcestore-backend ./backend'

    sh 'docker build -t pcestore-gateway ./api-gateway'

    sh 'docker build -t pcestore-frontend ./frontend'
            }
        }

        stage('4. Deploy') {
            steps {

        dir('/workspace') {

            sh '''

                pwd

                ls

                ls docker/nginx

                docker compose down || true

                docker compose up -d --build --scale backend=2

            '''
        }

    }
        }

        stage('5. Cleanup Docker') {
            steps {
                echo '===== Cleanup ====='

                sh 'docker image prune -f'
                sh 'docker container prune -f'
            }
        }
    }

    post {

        success {
            echo "======================================="
            echo "Build #${BUILD_NUMBER} SUCCESS"
            echo "======================================="
        }

        failure {
            echo "======================================="
            echo "Build #${BUILD_NUMBER} FAILED"
            echo "======================================="
        }

        always {
            echo "Pipeline finished"
        }
    }
}