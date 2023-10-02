import { 
    Body,
    Controller, 
    Delete, 
    Get, 
    Param, 
    Patch, 
    Post,
    UseGuards,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { MemberInfoDto } from 'src/common/dto/members/members.dto';
import { ParseIntPipe } from 'src/pipe/parse-int.pipe';

@UseGuards(JwtAuthGuard)
@Controller('members')
export class MembersController {
constructor( private membersService: MembersService){ }

    @Get()
    async getMembers(){
        return await this.membersService.getMembersInfo();
    }

    @Get('/pending')
    async getPendingMembers(){
        return await this.membersService.getPendingMembersInfo();
    }

    //사용 신청한 사용자를 승인
    @Post('/:id')
    async registerNewMember(
        @Param('id', new ParseIntPipe()) id: number, 
    ){
        return await this.membersService.approveMember(id);
    }

    @Patch('/:id')
    async changeMemberInfo(
        @Param('id', new ParseIntPipe()) id: number,
        @Body() memberInfo: MemberInfoDto
    ){
        return await this.membersService.changeMembersInfo(id, memberInfo);
    }

    @Delete('/:id')
    async deleteMember(
        @Param('id', new ParseIntPipe()) id: number
    ){
        return await this.membersService.deleteMember(id);
    }

}
