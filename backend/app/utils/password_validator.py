from pydantic import BaseModel, Field, validator
import re

class PasswordValidation:
    """Utilidad para validar contraseñas con requisitos de seguridad"""
    
    @staticmethod
    def validate_password(password: str) -> dict:
        """
        Valida una contraseña contra los requisitos de seguridad
        
        Returns:
            dict: {
                'valid': bool,
                'errors': list,
                'requirements': dict
            }
        """
        errors = []
        requirements = {
            'min_length': len(password) >= 8,
            'has_uppercase': bool(re.search(r'[A-Z]', password)),
            'has_lowercase': bool(re.search(r'[a-z]', password)),
            'has_number': bool(re.search(r'\d', password)),
            'has_special_char': bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
        }
        
        if not requirements['min_length']:
            errors.append("La contraseña debe tener al menos 8 caracteres")
        
        if not requirements['has_uppercase']:
            errors.append("La contraseña debe contener al menos una letra mayúscula")
        
        if not requirements['has_lowercase']:
            errors.append("La contraseña debe contener al menos una letra minúscula")
        
        if not requirements['has_number']:
            errors.append("La contraseña debe contener al menos un número")
        
        if not requirements['has_special_char']:
            errors.append("La contraseña debe contener al menos un carácter especial (!@#$%^&*(),.?\":{}|<>)")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'requirements': requirements
        }