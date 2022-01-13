const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");

const BlockChain = require("./blockChain");
const bitcoin = new BlockChain();

//나의 네트워크 고유 아이디 생성
const { v1 } = require("uuid");
const nodeAddress = v1().split("-").join("");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.send("Hello World");
});

// 웹브라우저에 get 방식으로 /blockchain 주소를 입력했을 때 실행
app.get("/blockchain", function (req, res) {
  res.send(bitcoin);
});

// 웹브라우저에 post 방식으로 /transaction 주소를 입력했을 때 실행
app.post("/transaction", function (req, res) {
  const blockIndex = bitcoin.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient,
  );
  res.json({ note: `트랜젝션은 ${blockIndex} 블락안으로 들어갈 예정입니다.` });
});

// 웹브라우저에 get 방식으로 /mine 주소를 입력했을 때 실행
app.get("/mine", function (req, res) {
  //마지막 블럭을 가져온다.
  const lastBlock = bitcoin.getLastBlock();

  //마지막 블럭의 해쉬 값, 즉 이전 블럭의 해쉬값
  const previousBlockHash = lastBlock["hash"];

  //현재 블락의 데이터 : 미완료된 거래내역 + 블락의 index 값
  const currentBlockData = {
    transactions: bitcoin.pendingTransaction,
    index: lastBlock["index"] + 1,
  };

  //이전블락해쉬, 현재블럭 데이터를 proofOfWork에 넣고 맞는 hash값(0000sfaff...)을 찾고 해당 nonce 값을 리턴.
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  //이전블락해쉬, 현재블럭 데이터, nonce 값을 넣고 현재 블락의 해쉬 값 리턴
  const blockHash = bitcoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce,
  );

  //채굴에 대한 보상
  bitcoin.createNewTransaction(10, "bosang0000", nodeAddress);

  //새로운 블락을 생성하려면 nonce,previousBlockHash,blockHash 값이 필요하다.
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);

  res.json({
    note: "새로운 블락이 성공적으로 만들어졌습니다.",
    newBlock: newBlock,
  });
});

app.listen(PORT, () => {
  console.log(`server running on ${PORT || 3000}`);
});
