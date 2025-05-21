import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
  } from '@nestjs/common';
  import { RpcException } from '@nestjs/microservices';
  
  @Catch(RpcException)
  export class RpcExceptionFilter implements ExceptionFilter {
    catch(exception: RpcException, host: ArgumentsHost) {
      const ctx = host.switchToRpc();
      const data = ctx.getData();
  
      return {
        status:400,
        message: exception.message,
        data,
      };
    }
  }