(function() {
  var members, board, tournament, players;

  players = {
    create: function( num ) {
      var i, _players = [];
      rating = 1000;
      for ( i = 0; i < num; i++ ) {
        _players.push( {
          id: i,
          rating: rating
        } );
        rating -= Math.floor( 100 * Math.random() );
      }
      return _players;
    },
    show: function( _players ) {
      console.log( _players.map( function( player ) {
        return player.rating;
      }) );
    }
  };

  tournament = {
    standings: [],
    clear: function() {
      this.standings = [];
    },
    /**
     * Create standings
     *
     */
    create: function( _players ) {
      var i, max, player;
      for ( i = 0, max = _players.length; i < max; i++ ) {
        player = _players[ i ];
        this.standings.push( {
          playerId: player.id,
          rating: player.rating,
          win: 0,
          progress: [],
          // 次の試合を決めるスコアのキャッシュ
          _scoreForNextContest: 0,
          // 最終スコア
          _scoreForContest: 0
        });
      }
    },
    isWinner: function( player1, player2 ) {
      var diffRating, winRate;
      diffRating = player1.rating - player2.rating;
      winRate =  0.5 + diffRating/1000;
      return Math.random() < winRate;
    },
    /**
     * @method contest
     *
     * @return whether player1 wins
     */
    contest: function( player1, player2 ) {
      var result;
      if ( player2 === undefined ) {
        this.winByDefault( player1 );
        return;
      }

      result = this.isWinner( player1, player2 );
      this.addProgress( player1, player2, result );
      this.addProgress( player2, player1, !result );
      return result;
    },
    winByDefault: function( player ) {
      this.addProgress( player, { playerId: -1 }, true );
    },
    addProgress: function( player, opponent, result ) {
      player.progress.push( {
        opponentId: ( opponent ) ? opponent.playerId : -1,
        result: ( result ) ? 1 : 0
      } );
      if ( result ) {
        player.win++;
      }
    },
    setScoreForNextContest: function( player1 ) {
      var _score = 0;
      _score += player1.progress.length * 1000;
      _score += player1.win;
      _score += Math.random() / 1000;
      player1._scoreForNextContest = _score;
      return _score;
    },
    compareForNextContest: function( player1, player2 ) {
      return player1._scoreForNextContest - player2._scoreForNextContest;
    },
    /**
     * 次の対戦に向けてソート
     *
     */
    sortForNextContests: function() {
      var _standings = [], i, max, player;
      for ( i = 0, max = this.standings.length; i < max; i++ ) {
        player = this.standings[ i ];
        this.setScoreForNextContest( player );
        _standings.push( player );
      }
      _standings.sort( this.compareForNextContest );
      return _standings;
    },
    nextOpponents: function( player, _standings ) {
      var i, max, _nextOpponents = [];
      
      for ( i = _standings.length - 1; i >= 0; i-- ) {
        if ( player.playerId !== _standings[ i ].playerId && !this.hasContest( player, _standings[ i ] ) ) {
          _nextOpponents.push( { index: i, opponent: _standings[ i ] } );
        }
      }
      return _nextOpponents;
    },
    hasContest: function( player1, player2 ) {
      var i, max;
      for ( i = 0, max = player1.progress.length; i < max; i++ ) {
        if ( player1.progress[ i ].opponentId === player2.playerId ) {
          return true;
        }
      }
      return false;
    },
    contests: function() {
      var i, max, _contests = [], player1, player2, _nextOpponents1, _nextOpponents2;
      _standings = this.sortForNextContests();

      while ( _standings.length > 0 ) {
        player1 = _standings[ _standings.length - 1 ];
        _nextOpponents1 = this.nextOpponents( player1, _standings );
        for ( i = 0, max = _nextOpponents1.length; i < max; i++ ) {
          player2 = _nextOpponents1[ i ].opponent;
          _nextOpponents2 = this.nextOpponents( player2, _standings );
          if ( _nextOpponents2.length !== 1 || _nextOpponents2[ 0 ].opponent.playerId === player1.playerId ) {
            _standings.splice( _nextOpponents1[ i ].index, 1 );
            _standings.pop();
            break;
          }
        }
        if ( i === max ) {
          throw "==============MAX==============";
        }
        _contests.push( player1.playerId );
        if ( player2 ) {
          _contests.push( player2.playerId );
        }
        this.contest( player1, player2 );

      }

      // for ( i = 0, max = _standings.length; i < max; i+= 2 ) {
      //   player1 = _standings[ i ];
      //   player2 = _standings[ i + 1 ];
      //   _contests.push( player1.playerId );
      //   if ( player2 ) {
      //     _contests.push( player2.playerId );
      //   }
      //   this.contest( player1, player2 );
      // }

      for ( i = 0, max = this.standings.length; i < max; i++ ) {
        this.setScoreForContest( this.standings[ i ] );
      }
      console.log( "contests" );
      console.log( JSON.stringify( _contests ) );
    },
    showProgress: function(){
      var i, max, result = [];
      for ( i = 0, max = this.standings.length; i < max; i++ ) {
        // result.push( this.standings[ i ].win );
        result.push( this.standings[ i ]._scoreForContest );
      }
      console.log( result );
    },
    setScoreForContest: function( player ) {
      var _score = 0, i, max, progress, sb = 0, solocov = 0, opponent;
      _score += player.win * 1000000;
      for ( i = 0, max = player.progress.length; i < max; i++ ) {
        progress = player.progress[ i ];
        opponent = this.standings[ player.progress[ i ].opponentId ];
        // console.log( opponent );
        solocov += opponent.win;
        if ( progress.result === 1 ) {
          sb += opponent.win;
        }
      }
      _score += solocov * 1000;
      _score += sb;
      player._scoreForContest = _score / 1000000;
    },
    execute: function() {
      var _players, i, numMembers = 16, numContests = 8;
      _players = players.create( numMembers );
      players.show( _players );
      tournament.create( _players );
      for ( i = 0; i < numContests; i++ ) {
        tournament.contests();
        tournament.showProgress();
      }
    }
  };

  window.t = tournament;

})();
