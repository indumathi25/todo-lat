import logging
import jwt
import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication
from rest_framework import exceptions

logger = logging.getLogger(__name__)
User = get_user_model()

class Auth0JSONWebTokenAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        token = None
        auth = request.META.get('HTTP_AUTHORIZATION', None)
        
        if auth:
            parts = auth.split()
            if parts[0].lower() != 'bearer':
                logger.debug("Authorization header must start with Bearer")
                return None
            
            if len(parts) == 1:
                logger.debug("Invalid header. No credentials provided.")
                raise exceptions.AuthenticationFailed('Invalid header. No credentials provided.')
            elif len(parts) > 2:
                logger.debug("Invalid header. Token string should not contain spaces.")
                raise exceptions.AuthenticationFailed('Invalid header. Token string should not contain spaces.')
            
            token = parts[1]
        else:
            token = request.COOKIES.get('access_token')

        if not token:
            return None
        
        try:
            payload = self.verify_token(token)
        except jwt.PyJWTError as e:
            logger.error(f"Invalid token: {str(e)}")
            raise exceptions.AuthenticationFailed(f'Invalid token: {str(e)}')
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}")
            raise exceptions.AuthenticationFailed(f'Error verifying token: {str(e)}')
            
        user = self.get_or_create_user(payload)
        logger.debug(f"Authenticated user: {user.username}")
        return (user, token)

    def verify_token(self, token):
        domain = settings.AUTH0_DOMAIN
        audience = settings.AUTH0_AUDIENCE
        
        jwks_url = f'https://{domain}/.well-known/jwks.json'
        jwks = requests.get(jwks_url).json()
        
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks['keys']:
            if key['kid'] == unverified_header['kid']:
                rsa_key = {
                    'kty': key['kty'],
                    'kid': key['kid'],
                    'use': key['use'],
                    'n': key['n'],
                    'e': key['e']
                }
        
        if rsa_key:
            payload = jwt.decode(
                token,
                jwt.algorithms.RSAAlgorithm.from_jwk(rsa_key),
                algorithms=['RS256'],
                audience=audience,
                issuer=f'https://{domain}/'
            )
            return payload
        
        raise exceptions.AuthenticationFailed('Unable to find appropriate key.')

    def get_or_create_user(self, payload):
        sub = payload.get('sub')
        if not sub:
            raise exceptions.AuthenticationFailed('Invalid payload. No sub claim.')
            
        try:
            user = User.objects.get(username=sub)
        except User.DoesNotExist:
            user = User.objects.create_user(username=sub)
            
        return user
