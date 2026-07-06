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
        WORKSPACE_DIR = "/workspace"
    }

    stages {
        stage('1. Verify Workspace') {
            steps {
                dir("${WORKSPACE_DIR}") {
                    sh '''
                        set -eu
                        pwd
                        test -f docker-compose.yml
                        test -f docker/nginx/nginx.conf
                    '''
                }
            }
        }

        stage('2. Build Applications') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir("${WORKSPACE_DIR}/backend") {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }

                stage('Build API Gateway') {
                    steps {
                        dir("${WORKSPACE_DIR}/api-gateway") {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }

                stage('Build Frontend') {
                    steps {
                        dir("${WORKSPACE_DIR}/frontend") {
                            sh 'npm ci || npm install'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('3. Deploy Docker Compose') {
            steps {
                dir("${WORKSPACE_DIR}") {
                    sh '''
                        set -eu
                        docker compose pull --ignore-pull-failures
                        docker compose up -d --build --remove-orphans
                    '''
                }
            }
        }

        stage('4. Verify Deployment') {
            steps {
                dir("${WORKSPACE_DIR}") {
                    sh '''
                        set -eu
                        docker compose ps
                    '''
                }
            }
        }

        stage('5. Cleanup Docker') {
            steps {
                sh 'docker image prune -f'
                sh 'docker container prune -f'
            }
        }
    }

    post {
        success {
            echo "Build #${BUILD_NUMBER} SUCCESS"
        }

        failure {
            echo "Build #${BUILD_NUMBER} FAILED"
        }

        always {
            echo "Pipeline finished"
        }
    }
}