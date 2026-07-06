# AWS EC2 Hybrid Deployment

Tai lieu nay mo ta cach trien khai project theo mo hinh:

- Frontend: Vercel
- API stack: AWS EC2 + Docker Compose
- QR generator: AWS Lambda + API Gateway
- CI/CD: Jenkins container tren EC2

## 1. Chuan Bi EC2

Khuyen nghi instance toi thieu:

- `t3.medium` neu chi chay app stack
- `t3.large` neu chay them Jenkins, PostgreSQL, Redis, RabbitMQ tren cung may

Security Group:

- `22`: chi mo IP ca nhan
- `80`: public
- `443`: public
- `8082`: Jenkins, chi mo IP ca nhan

Cai Docker tren Ubuntu:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker ubuntu
```

Dang xuat SSH va dang nhap lai de group `docker` co hieu luc.

## 2. Clone Project Va Env

```bash
cd /home/ubuntu
git clone <your-repo-url> DTDM
cd DTDM
cp .env.production.example .env
nano .env
```

Can doi cac gia tri bat buoc:

- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `RABBITMQ_PASSWORD`
- `JWT_SECRET_KEY`
- `FRONTEND_URL`
- `CORS_ALLOWED_ORIGINS`
- `AWS_LAMBDA_QR_URL`
- cac bien mail, Google OAuth, SePay neu dung production

## 3. Deploy Docker Stack Tren EC2

```bash
cd /home/ubuntu/DTDM
docker compose up -d --build
docker compose ps
```

Test API qua IP:

```bash
curl http://<EC2_PUBLIC_IP>/api/products
```

Neu chua co domain, frontend Vercel co the tam thoi dung:

```text
VITE_API_BASE_URL=http://<EC2_PUBLIC_IP>/api
```

## 4. Deploy QR Generator Len AWS Lambda

Yeu cau local/EC2 co AWS CLI da login:

```bash
aws configure
```

Dong goi function:

```bash
cd serverless/qr-generator
npm install --omit=dev
npm run zip
```

Tao IAM role co policy `AWSLambdaBasicExecutionRole`, sau do tao Lambda:

```bash
aws lambda create-function \
  --function-name pcestore-qr-generator \
  --runtime nodejs22.x \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --role arn:aws:iam::<ACCOUNT_ID>:role/<LAMBDA_EXECUTION_ROLE>
```

Tao HTTP API Gateway:

```bash
aws apigatewayv2 create-api \
  --name pcestore-qr-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:<REGION>:<ACCOUNT_ID>:function:pcestore-qr-generator
```

Cap quyen API Gateway invoke Lambda:

```bash
aws lambda add-permission \
  --function-name pcestore-qr-generator \
  --statement-id apigateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com
```

Lay endpoint API Gateway va dien vao `.env`:

```env
AWS_LAMBDA_QR_URL=https://xxxx.execute-api.<REGION>.amazonaws.com/qr
```

Sau do restart backend:

```bash
docker compose up -d --build backend
```

## 5. Deploy Frontend Tren Vercel

Trong Vercel project settings:

```text
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

Environment variables:

```text
VITE_API_BASE_URL=https://api.pcestore.com/api
```

Neu chua co domain:

```text
VITE_API_BASE_URL=http://<EC2_PUBLIC_IP>/api
```

## 6. Domain Va HTTPS

DNS khuyen nghi:

```text
pcestore.com      -> Vercel
www.pcestore.com  -> Vercel
api.pcestore.com  -> EC2 Elastic IP
```

Voi EC2, nen gan Elastic IP truoc khi tro DNS.

Cai Certbot:

```bash
sudo apt-get install -y certbot
sudo certbot certonly --standalone -d api.pcestore.com
```

Sau khi co cert, cau hinh nginx de listen `443` va proxy `/api/` vao gateway. Neu chua cau hinh TLS trong nginx, co the dung HTTP tam thoi trong giai doan test.

## 7. Jenkins CI/CD

Chay Jenkins:

```bash
docker compose -f docker-compose-jenkins.yml up -d --build
```

Mo:

```text
http://<EC2_PUBLIC_IP>:8082
```

Pipeline hien tai dung `/workspace`, path nay duoc mount tu:

```yaml
/home/ubuntu/DTDM:/workspace
```

GitHub webhook tro ve Jenkins endpoint tuong ung job pipeline.

## 8. Bao Mat Production

- Khong public PostgreSQL, Redis, RabbitMQ ra internet.
- Doi tat ca password mac dinh trong `.env`.
- Dung `JWT_SECRET_KEY` dai va random.
- Rotate va xoa private key neu `pcestore-vm-key.pem` da tung bi commit.
- Backup `postgres_data` dinh ky.
- Chi mo port Jenkins cho IP ca nhan.
- Khong chay `--scale backend=2` cho den khi seed data va upload shared storage duoc xu ly an toan.
