#!/usr/bin/env bash
set -euo pipefail

FUNCTION_NAME="${FUNCTION_NAME:-pcestore-qr-generator}"
REGION="${AWS_REGION:-ap-southeast-1}"
RUNTIME="${LAMBDA_RUNTIME:-nodejs22.x}"
ROLE_ARN="${LAMBDA_ROLE_ARN:-}"

if [[ -z "$ROLE_ARN" ]]; then
  echo "Missing LAMBDA_ROLE_ARN. Example:"
  echo "LAMBDA_ROLE_ARN=arn:aws:iam::<account-id>:role/<lambda-role> $0"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LAMBDA_DIR="$PROJECT_ROOT/serverless/qr-generator"

cd "$LAMBDA_DIR"
npm install --omit=dev
npm run zip

if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" >/dev/null 2>&1; then
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file fileb://function.zip \
    --region "$REGION"
else
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime "$RUNTIME" \
    --handler index.handler \
    --zip-file fileb://function.zip \
    --role "$ROLE_ARN" \
    --region "$REGION"
fi

echo "Lambda deployed: $FUNCTION_NAME in $REGION"
