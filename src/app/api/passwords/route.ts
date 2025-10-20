import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import CryptoJS from "crypto-js";
import { connectDB } from "@/lib/mongodb";
import { Password } from "@/models/Password";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET!;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string };
  } catch {
    return null;
  }
}

function encryptPassword(password: string): string {
  return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
}

function decryptPassword(encryptedPassword: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function calculatePasswordStrength(password: string): string {
  if (password.length < 6) return "weak";
  if (password.length < 12) return "medium";
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(
    Boolean
  ).length;
  return strength >= 3 ? "strong" : "medium";
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const passwords = await Password.find({ userId: decoded.id }).sort({
      createdAt: -1,
    });

    const decryptedPasswords = passwords.map((pwd) => ({
      id: pwd._id.toString(),
      title: pwd.title,
      username: pwd.username,
      password: decryptPassword(pwd.password),
      url: pwd.url,
      category: pwd.category,
      strength: pwd.strength,
      lastModified: pwd.updatedAt,
    }));

    return NextResponse.json({ passwords: decryptedPasswords });
  } catch (err) {
    console.error("Error fetching passwords:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { title, username, password, url, category } = await req.json();

    if (!title || !password) {
      return NextResponse.json(
        { error: "Title and password are required" },
        { status: 400 }
      );
    }

    if (
      category &&
      !["personal", "work", "finance", "device"].includes(category)
    ) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    await connectDB();

    const strength = calculatePasswordStrength(password);

    const encryptedPassword = encryptPassword(password);

    const newPassword = await Password.create({
      userId: decoded.id,
      title,
      username: username || "",
      password: encryptedPassword,
      url: url || "",
      category: category || "personal",
      strength,
    });

    return NextResponse.json(
      {
        message: "Password added successfully",
        password: {
          id: newPassword._id.toString(),
          title: newPassword.title,
          username: newPassword.username,
          url: newPassword.url,
          category: newPassword.category,
          strength: newPassword.strength,
          lastModified: newPassword.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error creating password:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id, title, username, password, url, category } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Password ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const existingPassword = await Password.findOne({
      _id: id,
      userId: decoded.id,
    });

    if (!existingPassword) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    if (title) existingPassword.title = title;
    if (username !== undefined) existingPassword.username = username;
    if (password) {
      existingPassword.password = encryptPassword(password);
      existingPassword.strength = calculatePasswordStrength(password);
    }
    if (url !== undefined) existingPassword.url = url;
    if (category) existingPassword.category = category;

    await existingPassword.save();

    return NextResponse.json({
      message: "Password updated successfully",
      password: {
        id: existingPassword._id.toString(),
        title: existingPassword.title,
        username: existingPassword.username,
        url: existingPassword.url,
        category: existingPassword.category,
        strength: existingPassword.strength,
        lastModified: existingPassword.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error updating password:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Password ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await Password.deleteOne({ _id: id, userId: decoded.id });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Password deleted successfully" });
  } catch (err) {
    console.error("Error deleting password:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
