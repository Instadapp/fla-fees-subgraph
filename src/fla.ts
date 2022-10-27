import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  ExecuteOperationCall,
  FLA,
  OnFlashLoanCall,
  ReceiveFlashLoanCall,
} from "../generated/FLA/FLA";
import { FeeData } from "../generated/schema";

// const DAI = new Address(0x6b175474e89094c44da98b954eedeac495271d0f);
export function handleExecuteOperation(call: ExecuteOperationCall): void {
  // let assets = call.inputs._assets;
  // let amounts = call.inputs._amounts;
  // let user = call.inputs._initiator;
  let fees = call.inputs._premiums;
  let length = fees.length;
  let data_ = call.inputs._data;

  let decoded = ethereum.decode("(uint256,address[],uint256[],address,bytes)", data_)?.toTuple();
  if (decoded != undefined) {
    let tokens = decoded[1].toArray();
    let amounts = decoded[2].toArray();
    let user = decoded[3].toAddress();

    for (let i = 0; i < length; i++) {
      let id = user.toHexString() + "#" + tokens[i].toAddress().toHexString();
      let data = createOrLoadFeeData(id);
      data.user = user;
      data.token = tokens[i].toAddress();

      let instaAmt_ = amounts[i]
        .toBigInt()
        .times(BigInt.fromI32(5))
        .div(BigInt.fromI32(1e4));
      if (instaAmt_ > fees[i]) {
        data.flaFee += instaAmt_.minus(fees[i]).toI32();
      }
      data.routeFee += fees[i].toI32();
      data.save();
    }
  }
}

export function handleOnFlashloan(call: OnFlashLoanCall): void {
  // let amount = call.inputs._amount;
  let fee = call.inputs._fee;
  let data_ = call.inputs._data;
  let decoded = ethereum.decode("(uint256,address[],uint256[],address,bytes)", data_)?.toTuple();
  if (decoded != undefined) {
    let tokens = decoded[1].toArray();
    let amounts = decoded[2].toArray();
    let user = decoded[3].toAddress();

    for (let i = 0; i < tokens.length; i++) {
      let id = user.toHexString() + "#" + tokens[i].toAddress().toHexString();
      let data = createOrLoadFeeData(id);
      data.user = user;
      data.token = tokens[i].toAddress();

      let instaAmt_ = amounts[i]
        .toBigInt()
        .times(BigInt.fromI32(5))
        .div(BigInt.fromI32(1e4));
      if (instaAmt_ > fee) {
        data.flaFee += instaAmt_.minus(fee).toI32();
      }
      data.routeFee += fee.toI32();
      data.save();
    }
  }
}

export function handleReceiveFlashloan(call: ReceiveFlashLoanCall): void {
  let fees = call.inputs._fees;
  let length = fees.length;
  let data_ = call.inputs._data;

  let decoded = ethereum.decode("(uint256,address[],uint256[],address,bytes)", data_)?.toTuple();
  if (decoded != undefined) {
    let tokens = decoded[1].toArray();
    let amounts = decoded[2].toArray();
    let user = decoded[3].toAddress();

    for (let i = 0; i < length; i++) {
      let id = user.toHexString() + "#" + tokens[i].toAddress().toHexString();
      let data = createOrLoadFeeData(id);
      data.user = user;
      data.token = tokens[i].toAddress();

      let instaAmt_ = amounts[i]
        .toBigInt()
        .times(BigInt.fromI32(5))
        .div(BigInt.fromI32(1e4));
      if (instaAmt_ > fees[i]) {
        data.flaFee += instaAmt_.minus(fees[i]).toI32();
      }
      data.routeFee += fees[i].toI32();
      data.save();
    }
  }
}

export function createOrLoadFeeData(id: string): FeeData {
  let data = FeeData.load(id);
  if (data == null) {
    data = new FeeData(id);
    data.user = new Address(0);
    data.token = new Address(0);
    data.flaFee = 0;
    data.routeFee = 0;
  }
  return data;
}
