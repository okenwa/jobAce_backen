import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { PrismaClient } from '@prisma/client';
import { Request } from 'express';

const prisma = new PrismaClient();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.API_URL}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Check if user exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { googleId: profile.id },
              { email: profile.emails[0].value },
            ],
          },
        });

        if (existingUser) {
          // Update Google ID if user exists but doesn't have one
          if (!existingUser.googleId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { googleId: profile.id },
            });
          }
          return done(null, existingUser);
        }

        // Create new user
        const newUser = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            name: profile.displayName,
            googleId: profile.id,
            role: 'USER',
          },
        });

        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
      callbackURL: `${process.env.API_URL}/auth/facebook/callback`,
      profileFields: ['id', 'displayName', 'email'],
      passReqToCallback: true,
    },
    async (req: Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // Check if user exists
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { facebookId: profile.id },
              { email: profile.emails[0].value },
            ],
          },
        });

        if (existingUser) {
          // Update Facebook ID if user exists but doesn't have one
          if (!existingUser.facebookId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { facebookId: profile.id },
            });
          }
          return done(null, existingUser);
        }

        // Create new user
        const newUser = await prisma.user.create({
          data: {
            email: profile.emails[0].value,
            name: profile.displayName,
            facebookId: profile.id,
            role: 'USER',
          },
        });

        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

export default passport; 