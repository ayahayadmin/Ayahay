import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilityService {
  /**
   * generates a reference number according to this format
   * aaaaabbbbbbbbbb
   * wherein a is a 5-character long random string
   * and b is the hexadecimal representation of an ID
   * @param id
   */
  generateReferenceNo(id: number) {
    const randomString = this.generateRandomAlphanumericString(5);
    return `${randomString}${id.toString(16).toUpperCase()}`;
  }

  generateRandomAlphanumericString(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }
}
