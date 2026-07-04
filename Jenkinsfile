pipeline {
    agent any

    tools {
        // Cần được cấu hình tên tương ứng trong "Manage Jenkins -> Global Tool Configuration"
        maven "maven-3"
        jdk "jdk-17"
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        // Thay thế bằng thông tin Docker Registry của bạn nếu push lên Cloud
        DOCKER_REGISTRY = "pcestore-registry.local"
        APP_VERSION = "${BUILD_NUMBER}"
    }

    stages {
        stage('1. Checkout Code') {
            steps {
                echo 'Đang kéo mã nguồn mới nhất từ kho lưu trữ...'
                checkout scm
            }
        }

        stage('2. Test Backend') {
            steps {
                echo 'Bắt đầu chạy kiểm thử (Unit/Integration Tests) cho Spring Boot...'
                dir('backend') {
                    sh 'mvn clean test'
                }
            }
        }

        stage('3. Build Artifacts') {
            parallel {
                stage('Build Spring Boot Backend') {
                    steps {
                        echo 'Đóng gói file JAR cho Backend...'
                        dir('backend') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }
                
                stage('Build API Gateway') {
                    steps {
                        echo 'Đóng gói file JAR cho API Gateway...'
                        dir('api-gateway') {
                            sh 'mvn clean package -DskipTests'
                        }
                    }
                }

                stage('Build React Frontend') {
                    steps {
                        echo 'Cài đặt dependencies và build Production bundle cho React...'
                        dir('frontend') {
                            // Cài đặt và build frontend
                            sh 'npm install'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('4. Build Docker Images') {
            steps {
                echo 'Xây dựng các Docker image từ source-code...'
                sh 'docker build -t pcestore-backend:latest ./backend'
                sh 'docker build -t pcestore-gateway:latest ./api-gateway'
                sh 'docker build -t pcestore-frontend:latest ./frontend'
            }
        }

        stage('5. Deploy Applications') {
            steps {
                echo 'Khởi chạy toàn bộ hệ thống bằng Docker Compose...'
                // Dừng và xóa containers cũ, sau đó start containers mới
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
                echo 'Hệ thống đã được deploy thành công!'
            }
        }
    }

    post {
        success {
            echo "Pipeline chạy thành công! Bản build #${BUILD_NUMBER} đã được triển khai."
        }
        failure {
            echo "Có lỗi xảy ra trong quá trình chạy Pipeline bản build #${BUILD_NUMBER}. Vui lòng kiểm tra console log."
        }
    }
}
