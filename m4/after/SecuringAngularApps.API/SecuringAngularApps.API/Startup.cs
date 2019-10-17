using System;
using System.Linq;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SecuringAngularApps.API.Model;

namespace SecuringAngularApps.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ProjectDbContext>(options =>
                options.UseSqlServer(Configuration.GetConnectionString("ProjectDbContext")));
            services.AddCors(options =>
            {
                options.AddPolicy("AllRequests", builder =>
                {
                    builder.AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowAnyOrigin()
                    .AllowCredentials();
                });
            });
            /* Configuring the middleware that will check for the jwt token ********************************************************** */
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                 .AddJwtBearer(options =>
                 {
                     // base-address of your identityserver
                     options.Authority = "https://securingangularappscourse-sts.azurewebsites.net/";
                     options.RequireHttpsMetadata = false;      // good during development ... no https required 
                     options.Audience = "projects-api";         // name of the API resource
                     // You can check for other stuff https://developer.okta.com/blog/2018/03/23/token-authentication-aspnetcore-complete-guide
                 });
            /* Configuring the middleware that will check for the jwt token ********************************************************** */

            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.UseCors("AllRequests");
            
            /* Adding the middleware (that checks for jwt) to the pipeline ********************************************************** */
            app.UseAuthentication();
            
            app.UseMvc();
        }
    }
}
