import { useLaserEyes } from "@omnisat/lasereyes";

export default function Test() {
  const { connect } = useLaserEyes(); // Call the function
  console.log(connect);

  return (
    <div>
      <button onClick={() => connect("unisat")}>Wallet Connect</button>
    </div>
  );
}
