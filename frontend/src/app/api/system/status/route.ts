import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  try {
    // Check for Simulator
    const { stdout: simOut } = await execAsync('powershell "Get-Process | Where-Object {$_.CommandLine -like \'*simulator.py*\'} | Select-Object -ExpandProperty Id"').catch(() => ({ stdout: "" }));
    
    // Check for Agent
    const { stdout: agentOut } = await execAsync('powershell "Get-Process | Where-Object {$_.CommandLine -like \'*agent.py*\'} | Select-Object -ExpandProperty Id"').catch(() => ({ stdout: "" }));

    return NextResponse.json({
      simulator: simOut.trim() !== "",
      agent: agentOut.trim() !== "",
    });
  } catch (error) {
    return NextResponse.json({ simulator: false, agent: false });
  }
}
