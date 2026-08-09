const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const KakaoStrategy = require('passport-kakao').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const NaverStrategy = require('passport-naver-v2').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  // Local Strategy
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: '가입되지 않은 이메일입니다.' });
      }
      
      if (!user.password) {
        return done(null, false, { message: '소셜 로그인으로 가입된 계정입니다. 소셜 로그인을 이용해주세요.' });
      }

      if (!user.isVerified) {
        return done(null, false, { message: '이메일 인증이 완료되지 않았습니다.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  // Kakao Strategy
  if(process.env.KAKAO_CLIENT_ID) {
    const kakaoOptions = {
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: '/api/auth/kakao/callback'
    };
    if (process.env.KAKAO_CLIENT_SECRET) {
      kakaoOptions.clientSecret = process.env.KAKAO_CLIENT_SECRET;
    }

    passport.use(new KakaoStrategy(kakaoOptions, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile._json?.kakao_account?.email || `kakao_${profile.id}@gilsmall.com`;
        const name = profile.displayName || profile.username || profile._json?.properties?.nickname || profile._json?.kakao_account?.profile?.nickname || '카카오유저';
        const snsId = profile.id;

        let user = await User.findOne({ snsId, provider: 'kakao' });
        if (!user) {
          user = await User.findOne({ email });
        }
        if (user) {
          let updated = false;
          // If already registered with another provider
          if(user.provider !== 'kakao' && !user.snsId) {
            user.provider = 'kakao';
            user.snsId = snsId;
            user.isVerified = true;
            updated = true;
          }
          // Auto-heal name if Kakao provided a new real name
          if (name !== '카카오유저' && user.name !== name) {
            user.name = name;
            updated = true;
          }
          if(updated) await user.save();
          return done(null, user);
        }

        user = await User.create({
          email,
          name,
          provider: 'kakao',
          snsId,
          isVerified: true
        });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));
  }

  // Google Strategy
  if(process.env.GOOGLE_CLIENT_ID) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = (profile.emails && profile.emails.length > 0) ? profile.emails[0].value : `google_${profile.id}@gilsmall.com`;
        const name = profile.displayName || '구글유저';
        const snsId = profile.id;

        let user = await User.findOne({ email });
        if (user) {
          if(user.provider !== 'google' && !user.snsId) {
            user.provider = 'google';
            user.snsId = snsId;
            user.isVerified = true;
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          email,
          name,
          provider: 'google',
          snsId,
          isVerified: true
        });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));
  }

  // Naver Strategy
  if(process.env.NAVER_CLIENT_ID) {
    passport.use(new NaverStrategy({
      clientID: process.env.NAVER_CLIENT_ID,
      clientSecret: process.env.NAVER_CLIENT_SECRET,
      callbackURL: '/api/auth/naver/callback'
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.email || profile._json?.email || `naver_${profile.id}@gilsmall.com`;
        const name = profile.name || profile._json?.name || '네이버유저';
        const snsId = profile.id;

        let user = await User.findOne({ email });
        if (user) {
          if(user.provider !== 'naver' && !user.snsId) {
            user.provider = 'naver';
            user.snsId = snsId;
            user.isVerified = true;
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          email,
          name,
          provider: 'naver',
          snsId,
          isVerified: true
        });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }));
  }
};
