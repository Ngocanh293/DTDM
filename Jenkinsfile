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
                echo '===== Checkout Source Code ====='
                checkout scm
            }
        }

        stage('2. Test Backend') {
            steps {
                echo '===== Running Backend Tests ====='
                dir('backend') {
                    sh 'mvn clean test'
                }
            }
        }

        stage('3. Build Applications') {
            parallel {

                stage('Build Backend') {
                    steps {
                        echo '===== Build Backend ====='
                        dir('backend') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }

                stage('Build API Gateway') {
                    steps {
                        echo '===== Build API Gateway ====='
                        dir('api-gateway') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        echo '===== Build Frontend ====='
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('4. Build Docker Images') {
            steps {
                echo '===== Build Docker Images ====='

                sh 'docker build -t pcestore-backend:latest ./backend'
                sh 'docker build -t pcestore-gateway:latest ./api-gateway'
                sh 'docker build -t pcestore-frontend:latest ./frontend'
            }
        }

        stage('5. Deploy') {
            steps {
                echo '===== Deploy Containers ====='

                sh '''
                    docker compose down || true
                    docker compose up -d --build --scale backend=2
                '''

                echo '===== Deploy Success ====='
            }
        }

        stage('6. Cleanup Docker') {
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
            cleanWs()
        }
    }
}