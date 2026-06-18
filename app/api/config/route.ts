import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    factories: {
      "11155111":
        process.env.FACTORY_SEPOLIA ||
        process.env.NEXT_PUBLIC_FACTORY_SEPOLIA ||
        "",
      "97":
        process.env.FACTORY_BSC_TESTNET ||
        process.env.NEXT_PUBLIC_FACTORY_BSC_TESTNET ||
        "",
    },
  });
}
