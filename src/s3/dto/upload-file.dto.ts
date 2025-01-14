import { IsString, MaxLength, IsNotEmpty } from 'class-validator';

export class UploadFileDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  route: string;
}