import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import {
  ExecuteOperationCall,
  FLA,
  LogFlashloan,
  OnFlashLoanCall,
  ReceiveFlashLoanCall,
} from "../generated/FLA/FLA";
import { FlashLoanFeePercentageChanged } from "../generated/Balancer/Balancer";
import { File } from "../generated/Maker/Maker";
import { FeeData } from "../generated/schema";

// const DAI = new Address(0x6b175474e89094c44da98b954eedeac495271d0f);
var balancerFee = BigInt.fromI32(0);
var makerBPS = BigInt.fromI32(0);
const e4 = BigInt.fromI32(10).pow(4);
const e14 = BigInt.fromI32(10).pow(14);
const e18 = BigInt.fromI32(10).pow(18);
export function handleFlashloan(event: LogFlashloan): void {
  //balancer: result = product == 0 ? 0 : ((product - 1) / FixedPoint.ONE) + 1;
  //maker: _mul(amount, toll) / WAD
  let tokens = event.params.tokens;
  let route = event.params.route.toI32();
  let amounts = event.params.amounts;
  let user = event.params.account;

  for (let i = 0; i < tokens.length; i++) {
    let id = user.toHexString() + "#" + tokens[i].toHexString();
    let data = createOrLoadFeeData(id);
    data.user = user;
    data.token = tokens[i];

    let fees_ = BigInt.fromI32(0);
    if (route == 1) {
      fees_ = amounts[i].times(BigInt.fromI32(9)).div((e4));
    } else if (route == 2 || route == 3 || route == 4) {
      fees_ = amounts[i].times(makerBPS).div((e4));
    } else if (route == 5 || route == 6 || route == 7) {
      let pdt_ = amounts[i].times(balancerFee);
      if (pdt_.toI32() == 0) {
        fees_ = BigInt.fromI32(0);
      } else {
        fees_ = pdt_
          .minus(BigInt.fromI32(1))
          .div(e18)
          .plus(BigInt.fromI32(1));
      }
    }

    let instaFees = amounts[i]
      .times(BigInt.fromI32(5))
      .div(e4);

    if (instaFees > fees_) {
      data.flaFee = instaFees.minus(fees_).toI32();
    }
    data.routeFee = fees_.toI32();
    data.save();
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

export function handleBalancerFeePercentChanged(
  event: FlashLoanFeePercentageChanged
): void {
  balancerFee = event.params.newFlashLoanFeePercentage;
}
export function handleMakerTollChanged(event: File): void {
  if (event.params.what.toString() == "toll")
    makerBPS = event.params.data.div(e14);
}
