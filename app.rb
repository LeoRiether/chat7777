require 'sinatra'
require 'sinatra-websocket'

set :sockets, []

get '/' do
  erb :index
end

get '/ws' do
  unless request.websocket?
    [400, 'Bad Request']
  else
    request.websocket do |ws|
      ws.onopen do
        settings.sockets << ws
      end
      ws.onmessage do |msg|
        EM.next_tick do 
          settings.sockets.each do |s|
            s.send(msg)
          end 
        end
      end
      ws.onclose do
        settings.sockets.delete(ws)
      end
    end
  end
end
