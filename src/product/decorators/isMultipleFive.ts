import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint()
export class IsMultipleOfFiveConstraint
  implements ValidatorConstraintInterface
{
  validate(value: number): boolean {
    return value % 5 === 0;
  }
}
