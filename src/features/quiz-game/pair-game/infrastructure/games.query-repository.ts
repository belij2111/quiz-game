import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, SelectQueryBuilder } from 'typeorm';
import { GamePairViewDto } from '../api/view-dto/game-pair.view-dto';
import { Game } from '../domain/game.entity';
import { Player } from '../domain/player.entity';
import { GameQuestion } from '../domain/game-question.entity';

@Injectable()
export class GamesQueryRepository {
  constructor(private readonly dataSource: DataSource) {}

  async getByIdOrNotFoundFail(id: string): Promise<GamePairViewDto> {
    const query = this.getBaseQuery(id);
    const foundGame = await query.getRawOne();
    if (!foundGame) {
      throw new NotFoundException(`Game with id ${id} not found`);
    }
    return GamePairViewDto.mapToView(foundGame);
  }

  private getBaseQuery(gameId: string): SelectQueryBuilder<Game> {
    return this.dataSource.manager
      .createQueryBuilder(Game, 'g')
      .where('g.id = :gameId', { gameId: gameId })
      .addCommonTableExpression(
        this.getPlayerProgress('first_player_id', gameId),
        'fp_cte',
      )
      .addCommonTableExpression(
        this.getPlayerProgress('second_player_id', gameId),
        'sp_cte',
      )
      .addCommonTableExpression(this.getGameQuestions(), 'gq_cte')

      .select([
        'g."id" as "id"',
        'fp_cte."playerProgress" as "firstPlayerProgress"',
        'sp_cte."playerProgress" as "secondPlayerProgress"',
        'gq_cte."questions" as "questions"',
        'g."status" as "status"',
        'g."created_at" as "pairCreatedDate"',
        'g."start_game_date" as "startGameDate"',
        'g."finished_game_date" as "finishedGameDate"',
      ])
      .leftJoin('fp_cte', 'fp_cte', 'fp_cte."playerId" = g."first_player_id"')
      .leftJoin('sp_cte', 'sp_cte', 'sp_cte."playerId" = g."second_player_id"')
      .leftJoin('gq_cte', 'gq_cte', 'gq_cte."gameId" = g."id"');
  }

  private getPlayerProgress(
    playerIdColumn: 'first_player_id' | 'second_player_id',
    gameId: string,
  ): SelectQueryBuilder<Player> {
    return this.dataSource.manager
      .createQueryBuilder(Player, 'p')
      .leftJoin('p.answer', 'a')
      .leftJoin('p.user', 'u')
      .select([
        'p."id" as "playerId"',
        `COALESCE (json_build_object(
          'answers',COALESCE(
            json_agg(
              json_build_object(
                'questionId' , a."question_id",
                'answerStatus' , a."answer_status",
                'addedAt' , a."created_at"
              )
              ORDER BY a."created_at" ASC
            ) FILTER (WHERE a."id" IS NOT NULL),'[]'::json
          ),
          'player', json_build_object(
          'id', u."id",
          'login', u."login"
          ),
          'score',COALESCE (p."score", 0)
          ),'null'::json        
        ) as "playerProgress"`,
      ])
      .where(
        `p."id" = (SELECT "${playerIdColumn}" from games WHERE id = :gameId)`,
      )
      .setParameters({ gameId: gameId })
      .groupBy('p."id", u."id", u."login", p."score"');
  }

  private getGameQuestions(): SelectQueryBuilder<GameQuestion> {
    return this.dataSource.manager
      .createQueryBuilder(GameQuestion, 'gq')
      .leftJoin('gq.question', 'q')
      .select([
        'gq."game_id" as "gameId"',
        `json_agg(
          json_build_object(
          'id', q."id",
          'body', q."body"
          )
          ORDER BY gq."id" ASC
        ) as "questions"`,
      ])
      .where('q."published" = true')
      .groupBy('gq."game_id"');
  }
}
