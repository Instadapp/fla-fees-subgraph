# FLA Fees Subgraph

Stores user fees generated for FLA, and that sent to route.

Query the subgraph: https://thegraph.com/hosted-service/subgraph/richa-iitr/fla-fees-mainnet

<pre>
{
  feeDatas {
    id
    user
    token
    flaFee
    routeFee
  }
}
</pre>
